'use client';

import { DataPagination } from '@/components/data/DataPagination';

interface NotificationPagerProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPage: (page: number) => void;
}

/** Numbered paging under the notification list, with the range shown on this page. */
export function NotificationPager({ page, totalPages, totalItems, pageSize, onPage }: NotificationPagerProps) {
  return (
    <DataPagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      unit="thông báo"
      onChange={onPage}
      className="mt-6 border-t pt-6"
    />
  );
}
