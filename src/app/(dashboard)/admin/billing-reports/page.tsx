import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/admin/membership-plans?tab=reports');
}
