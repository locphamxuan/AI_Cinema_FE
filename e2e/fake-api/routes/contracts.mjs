// Contract rounds of a project (contract.service, contract-studio.service): the Admin signs or counters here, the
// studio proposes, signs or counters on Studio Web (/studio-portal). A round with both signatures hands off.
import { id, notify, now, on, refuse } from '../core.mjs';
import { adminIds, contractView, findProject, projectFor, touch } from '../production.mjs';
import { sendTemplate } from './script.mjs';

const NEGOTIATING = ['ASSIGNED', 'IN_PRODUCTION', 'UNDER_REVISION'];
const PDF = '%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n';

/** The signature image the request carries: PNG or JPEG in the "file" field (signature-image.ts). */
function signatureOf(body) {
  const file = body.files?.find((f) => f.field === 'file');
  if (!file?.size || !['image/png', 'image/jpeg'].includes(file.contentType)) {
    throw refuse(400, 'Attach the signature image (PNG or JPEG) in the "file" field');
  }
  return file;
}

function contractFor(db, contractId, studioId) {
  const contract = db.contracts.find((c) => c.id === contractId && (!studioId || c.studioId === studioId));
  if (!contract) throw refuse(404, 'Contract not found');
  const project = findProject(db, contract.projectId);
  if (!NEGOTIATING.includes(project.status)) throw refuse(409, `The project is ${project.status}; its contract can no longer be answered`);
  return { contract, project };
}

function expect(contract, allowed, action) {
  if (!allowed.includes(contract.status)) {
    throw refuse(409, `Cannot ${action} a contract that is ${contract.status} (expected ${allowed.join(' or ')})`);
  }
}

function wholeCost(value, contract) {
  const cost = Number(value);
  if (!Number.isInteger(cost) || cost <= 0 || cost % 1000 !== 0) throw refuse(400, 'The cost must be a whole number of thousands of VND');
  if (contract.costVnd !== null && cost === contract.costVnd) {
    throw refuse(400, 'The new cost is the same as the cost of this round; sign the round instead');
  }
  return cost;
}

const sign = (contract, side) => {
  contract.documents = contract.documents.filter((d) => d.side !== side);
  contract.documents.push({ id: id(), side, fileName: `hop-dong-${side.toLowerCase()}.pdf`, sizeBytes: PDF.length, checksum: 'x', uploadedAt: now() });
};

function nextRound(db, contract, fields) {
  contract.status = 'SUPERSEDED';
  const next = { ...contract, id: id(), round: contract.round + 1, previousId: contract.id, createdAt: now(), documents: [], adminSignedAt: null, adminSignedById: null, studioSignedAt: null, ...fields };
  db.contracts.push(next);
  return next;
}

/** Both signatures: the project goes into production and its studio gets the hand-off (contract-completion.service). */
function complete(db, contract, project) {
  contract.status = 'SIGNED';
  sign(contract, 'FINAL');
  const waiting = contract.handoffId && db.handoffs.find((h) => h.id === contract.handoffId);
  if (waiting) Object.assign(waiting, { milestoneStatus: 'IN_PROGRESS', offeredFeeVnd: contract.costVnd });
  else {
    const handoff = {
      id: id(), movieId: project.id, studioId: contract.studioId, seasonId: null, offeredFeeVnd: contract.costVnd, forfeitedVnd: 0,
      changeReason: null, briefFileKey: `briefs/${contract.id}.pdf`, milestoneStatus: 'IN_PROGRESS', statusNote: null, respondedAt: null,
      declineReason: null, createdAt: now(), createdById: contract.createdById, emailMessage: { status: 'SENT', sentAt: now(), errorMessage: null },
      materials: [], milestoneEvents: [],
    };
    db.handoffs.push(handoff);
    contract.handoffId = handoff.id;
  }
  if (project.status === 'ASSIGNED') {
    project.status = 'IN_PRODUCTION';
    project.handedOffAt = now();
    for (const e of db.episodes.filter((x) => x.movieId === project.id && x.status === 'DRAFT')) e.status = 'AWAITING_MEDIA';
  }
  for (const who of [project.reviewerId, project.creatorId]) notify(who, `Hợp đồng phim "${project.title}" đã ký đủ hai bên; Studio bắt đầu sản xuất.`);
  touch(project);
}

const PROJECT_ROLES = ['ADMIN', 'CONTENT_REVIEWER', 'CONTENT_CREATOR'];
on('GET', '/projects/:id/contracts', ({ db, user, params }) => {
  const project = projectFor(db, params.id, user);
  return db.contracts.filter((c) => c.projectId === project.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.round - b.round).map((c) => contractView(db, c));
}, PROJECT_ROLES);

on('POST', '/projects/:id/contracts', ({ db, user, params, body }) => {
  const project = findProject(db, params.id);
  if (!project.studioId) throw refuse(409, 'Pick the studio of the project before sending its contract');
  if (project.status !== 'ASSIGNED') throw refuse(409, `A contract is only sent while the project is ASSIGNED, not ${project.status}`);
  return contractView(db, sendTemplate(db, project, user, body.terms));
}, ['ADMIN']);

on('POST', '/contracts/:id/sign', ({ db, user, params, body }) => {
  const { contract, project } = contractFor(db, params.id);
  expect(contract, ['STUDIO_SIGNED'], 'sign');
  signatureOf(body);
  Object.assign(contract, { adminSignedAt: now(), adminSignedById: user.id });
  sign(contract, 'ADMIN');
  complete(db, contract, project);
  return contractView(db, contract);
}, ['ADMIN']);

on('POST', '/contracts/:id/counter', ({ db, user, params, body }) => {
  const { contract } = contractFor(db, params.id);
  expect(contract, ['STUDIO_SIGNED', 'SENT'], 'counter');
  const costVnd = wholeCost(body.costVnd, contract);
  signatureOf(body);
  const next = nextRound(db, contract, { costVnd, proposedBy: 'ADMIN', status: 'ADMIN_COUNTERED', adminSignedAt: now(), adminSignedById: user.id });
  sign(next, 'ADMIN');
  return contractView(db, next);
}, ['ADMIN']);

on('GET', '/contracts/:id/documents', ({ db, params }) => contractFor(db, params.id).contract.documents, ['ADMIN', 'CONTENT_REVIEWER']);

const servePdf = ({ res }) => {
  res.writeHead(200, { 'Content-Type': 'application/pdf' });
  res.end(PDF);
};
on('GET', '/contracts/:id/template', servePdf, ['ADMIN', 'CONTENT_REVIEWER']);
on('GET', '/contracts/:id/documents/:side/content', servePdf, ['ADMIN', 'CONTENT_REVIEWER']);

// ---- Studio Web (/studio-portal): the studio answers its own rounds ----
const studioOf = (db, user) => db.studios.find((s) => s.email === user.email);
function tellAdmins(project, message) {
  for (const admin of adminIds()) notify(admin, message, '/contracts', 'CONTRACT');
  touch(project);
}

on('POST', '/studio-portal/contracts/:id/propose', ({ db, user, params, body }) => {
  const { contract, project } = contractFor(db, params.id, studioOf(db, user)?.id);
  expect(contract, ['SENT'], 'sign');
  signatureOf(body);
  const costVnd = body.costVnd ? wholeCost(body.costVnd, contract) : contract.ceilingVnd;
  if (!(costVnd > 0) || costVnd > contract.ceilingVnd) {
    throw refuse(409, 'The cost is above the production budget left');
  }
  Object.assign(contract, { costVnd, proposedBy: 'STUDIO', studioSignedAt: now(), status: 'STUDIO_SIGNED' });
  sign(contract, 'STUDIO');
  tellAdmins(project, `Studio báo giá ${costVnd} ₫ và đã ký hợp đồng, chờ Admin.`);
  return contractView(db, contract);
}, ['STUDIO']);

on('POST', '/studio-portal/contracts/:id/sign', ({ db, user, params, body }) => {
  const { contract, project } = contractFor(db, params.id, studioOf(db, user)?.id);
  expect(contract, ['ADMIN_COUNTERED'], 'sign');
  signatureOf(body);
  contract.studioSignedAt = now();
  sign(contract, 'STUDIO');
  complete(db, contract, project);
  return contractView(db, contract);
}, ['STUDIO']);

on('POST', '/studio-portal/contracts/:id/counter', ({ db, user, params, body }) => {
  const { contract, project } = contractFor(db, params.id, studioOf(db, user)?.id);
  expect(contract, ['ADMIN_COUNTERED'], 'answer with another price');
  const costVnd = wholeCost(body.costVnd, contract);
  signatureOf(body);
  const next = nextRound(db, contract, { costVnd, proposedBy: 'STUDIO', status: 'STUDIO_SIGNED', studioSignedAt: now() });
  sign(next, 'STUDIO');
  tellAdmins(project, `Studio đề xuất giá ${costVnd} ₫, chờ Admin.`);
  return contractView(db, next);
}, ['STUDIO']);

