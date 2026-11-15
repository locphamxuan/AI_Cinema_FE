import { redirect } from 'next/navigation';

/** The knowledge base moved into the AI Chatbox console. */
export default function Page() {
  redirect('/admin/support/ai?tab=knowledge');
}
