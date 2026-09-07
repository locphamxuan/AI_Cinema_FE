---
name: ui-ux-review
description: Review UI code của AI Cinema Web Portal theo Web Interface Guidelines chung + checklist đặc thù dự án (permission-gated UI, cổng tuân thủ nhãn AI, form ví coin). Dùng khi review/viết màn hình mới, hoặc khi được yêu cầu "review UI", "audit UX".
---

# UI/UX Review — AI Cinema Web Portal

Dùng skill này khi review hoặc tự kiểm tra một màn hình/component vừa viết trong `AI_Cinema_FE`. Kết hợp 2 lớp kiểm tra: (1) chuẩn chung, (2) checklist đặc thù nghiệp vụ dự án.

## Lớp 1 — Chuẩn chung
Áp dụng skill `web-design-guidelines` (Web Interface Guidelines) cho mọi màn hình: accessibility, contrast, focus state, responsive, loading/empty/error state.

## Lớp 2 — Checklist đặc thù AI Cinema

### Permission-gated UI
- [ ] Component nhạy cảm bọc trong `<RequirePermission permission="...">`, không chỉ ẩn bằng CSS.
- [ ] Nút hành động (Publish, Adjust wallet, Lock account...) disable rõ ràng kèm tooltip lý do khi user thiếu quyền, không im lặng biến mất.

### Cổng tuân thủ nhãn AI (MF-5 / BR-10)
- [ ] Màn hình review/publish phim hiển thị **trạng thái từng điều kiện nhãn** (overlay/metadata/legal_basis/coverage) dạng checklist trực quan, không chỉ 1 thông báo lỗi chung chung.
- [ ] Nút "Publish" tự disable khi còn điều kiện chưa đạt — không dựa hoàn toàn vào lỗi 400 từ API.

### Form chạm tiền/coin (MF-1, MF-2, MF-B, MF-D)
- [ ] Hiển thị rõ số dư main/bonus trước và sau giao dịch dự kiến.
- [ ] Nút submit disable ngay sau lần bấm đầu (chống double-submit), có trạng thái loading rõ ràng.
- [ ] Mọi request có `Idempotency-Key`.
- [ ] Thông báo lỗi "không đủ coin" dẫn thẳng tới hành động khắc phục (nút Nạp coin), không chỉ báo lỗi suông.

### Membership / auto-renew (MF-2)
- [ ] Màn hình hủy gói hiển thị rõ mốc 24h — nếu đã qua mốc, thông báo "kỳ này vẫn thu phí, dừng ở kỳ sau" thay vì cho tưởng nhầm là hủy ngay.

### Dashboard / báo cáo (Admin, Staff)
- [ ] Bảng số liệu lớn có empty-state và loading-skeleton riêng, không hiển thị bảng trống gây hiểu lầm là 0 dữ liệu.

## Cách dùng
1. Đọc code màn hình/component cần review.
2. Chạy qua Lớp 1 (web-design-guidelines) trước.
3. Chạy qua checklist Lớp 2 theo đúng module đang review (không cần check mục không liên quan).
4. Báo cáo theo mức độ: chặn release / nên sửa / góp ý nhỏ.
