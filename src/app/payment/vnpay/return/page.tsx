import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Kept for a VNPAY_RETURN_URL that still points at the web app. The query VNPay appends is not
 * trusted here: it is handed to the API's return route, which checks the signature, finds the
 * order and sends the member on to /wallet/top-ups/:topUpId. The wallet is credited by the IPN.
 */
export default async function VNPayReturnPage({ searchParams }: Readonly<PageProps>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === 'string') query.set(key, value);
  }
  redirect(`/api/payments/vnpay/return?${query.toString()}`);
}
