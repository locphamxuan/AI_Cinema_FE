import { redirect } from 'next/navigation';

/** The web app is the back office only: anyone arriving at the root signs in first. */
export default function RootPage() {
  redirect('/login');
}
