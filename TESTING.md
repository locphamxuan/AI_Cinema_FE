# Testing Strategy — AI_Cinema_FE

> Tài liệu chiến lược. Chưa cài package thật — thực hiện khi bắt đầu code từng feature (xem `../PROGRESS.md`).

## Test levels

| Level | Công cụ đề xuất | Phạm vi |
|---|---|---|
| Unit | Vitest + React Testing Library | Component thuần túy, hooks, utils tính toán hiển thị (vd format coin) |
| Integration | Vitest + RTL + MSW (mock API) | Feature flow: form submit → gọi API mock → hiển thị đúng trạng thái |
| E2E | Playwright | Luồng người dùng thật trên trình duyệt, nối BE thật (staging) hoặc mock server |
| Accessibility | axe-core (qua Playwright hoặc RTL) | Mọi màn hình publish/duyệt/form tiền chạy audit a11y tối thiểu |

## Ưu tiên theo mức rủi ro nghiệp vụ

1. **Cổng publish phim (MF-5, BR-10)** — E2E: publish phim thiếu nhãn → nút disable + hiện lý do; đủ nhãn → publish thành công.
2. **Guard theo permission** — Integration: user không có `movie:publish` không thấy/không bấm được nút Publish, kể cả gọi trực tiếp route.
3. **Form ví/coin** — Integration: double-click nút submit chỉ gửi 1 request (kiểm tra qua MSW request count), có `Idempotency-Key` header.
4. **Membership cancel** — Integration: hiển thị đúng thông báo trước/sau mốc 24h dựa trên `current_period_end` giả lập.

## Test data
Dùng MSW (Mock Service Worker) mock toàn bộ API theo OpenAPI spec của BE — không gọi BE thật trong unit/integration test.

## CI gate
Unit + Integration chạy mọi PR; E2E chạy trên staging trước khi release; a11y audit không chặn PR nhưng phải log lại vi phạm.
