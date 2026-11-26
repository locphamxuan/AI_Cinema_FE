// Partner studios (BR-59): the catalog the Admin keeps and the Create Project modal picks from.
import { on, refuse } from '../core.mjs';

on('GET', '/studios', ({ db, query }) => {
  const active = query.get('active');
  const items = active === null ? db.studios : db.studios.filter((s) => s.isActive === (active === 'true'));
  return items;
});

on('POST', '/studios', ({ db, body }) => {
  const name = String(body.name ?? '').trim();
  if (!name) throw refuse(400, 'Type the name of the studio (studioName)');
  const studio = { id: `studio-${db.studios.length + 1}`, name, email: body.email ?? null, phone: body.phone ?? null, isActive: true };
  db.studios.push(studio);
  return studio;
}, ['ADMIN']);