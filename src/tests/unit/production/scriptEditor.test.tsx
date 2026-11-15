import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from '@/components/ui/Toast';
import { ScriptEditor } from '@/features/production/components/project/ScriptEditor';
import { assignedProject, withProject } from '@/tests/support/projectContext';
import { failWith, routeFetch } from '@/tests/support/routeFetch';
import type { ScriptVersion } from '@/types/production';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const latest: ScriptVersion = {
  id: 'v2',
  version: 2,
  content: 'CẢNH 1 - NỘI. CĂN HỘ - ĐÊM',
  note: null,
  createdAt: '2026-11-02T00:00:00.000Z',
  submittedBy: { id: 'creator-id', fullName: 'Creator Một' },
};

function editor(from: ScriptVersion | null = latest) {
  const onSubmitted = vi.fn();
  render(withProject(assignedProject(), <ScriptEditor latest={from} onSubmitted={onSubmitted} />));
  return onSubmitted;
}

const content = () => screen.getByLabelText('Nội dung kịch bản');
const submit = () => screen.getByRole('button', { name: 'Nộp cho Reviewer' });

beforeEach(() => vi.mocked(toast.error).mockClear());
afterEach(() => vi.unstubAllGlobals());

describe('ScriptEditor', () => {
  it('starts the next version from the latest one and asks for a change before resubmitting', async () => {
    routeFetch({});
    editor();
    expect(screen.getByText('Soạn bản 3')).toBeInTheDocument();
    expect(content()).toHaveValue(latest.content);
    expect(submit()).toBeDisabled();
    expect(screen.getByText('Sửa kịch bản theo góp ý trước khi nộp lại.')).toBeInTheDocument();
  });

  it('sends the revised text with the change note and clears the note afterwards', async () => {
    const calls = routeFetch({ '/projects/m1/script/versions': { status: 'SUBMITTED', currentVersion: 3 } });
    const onSubmitted = editor();

    await userEvent.type(content(), '\nCẢNH 2 - NGOẠI. PHỐ - NGÀY');
    await userEvent.type(screen.getByLabelText('Ghi chú thay đổi so với bản trước'), 'Thêm cảnh 2');
    await userEvent.click(submit());

    await waitFor(() => expect(onSubmitted).toHaveBeenCalledWith(expect.objectContaining({ currentVersion: 3 })));
    const sent = calls.find((c) => c.path === '/projects/m1/script/versions')!;
    expect(JSON.parse(sent.body as string)).toEqual({ content: `${latest.content}\nCẢNH 2 - NGOẠI. PHỐ - NGÀY`, note: 'Thêm cảnh 2' });
    expect(screen.getByLabelText('Ghi chú thay đổi so với bản trước')).toHaveValue('');
  });

  it('has no change note on the first version and counts the characters', async () => {
    routeFetch({});
    editor(null);
    expect(screen.getByText('Soạn kịch bản')).toBeInTheDocument();
    expect(screen.queryByLabelText('Ghi chú thay đổi so với bản trước')).not.toBeInTheDocument();
    await userEvent.type(content(), 'CẢNH 1');
    expect(screen.getByText('6 ký tự')).toBeInTheDocument();
  });

  it('does not submit blank text', async () => {
    routeFetch({});
    editor(null);
    await userEvent.type(content(), '   ');
    expect(submit()).toBeDisabled();
  });

  it('keeps the text and shows the refusal when the submission fails', async () => {
    routeFetch({ '/projects/m1/script/versions': failWith(409, 'The script is SUBMITTED; wait for its review') });
    const onSubmitted = editor(null);

    await userEvent.type(content(), 'CẢNH 1');
    await userEvent.click(submit());

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Không thực hiện được', expect.stringContaining('wait for its review')));
    expect(onSubmitted).not.toHaveBeenCalled();
    expect(content()).toHaveValue('CẢNH 1');
  });
});
