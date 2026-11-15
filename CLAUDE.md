# AI Cinema — Web Portal (AI_Cinema_FE)

> Đọc `../docs/PROJECT_OVERVIEW.md` trước khi làm bất kỳ việc gì — đó là nguồn sự thật duy nhất về actor, business rule, main flow, API cho cả 3 repo. File này chỉ ghi quy ước riêng của web frontend.

## Vai trò của repo này
Web portal phân quyền theo vai trò cho **Content Manager, Staff (billing/support/marketing), Administrator** — quản trị nội dung, pipeline AI + gắn nhãn, membership, support desk, marketing, risk, báo cáo. (Member dùng mobile app là chính — xem `AI_Cinema_Mobile`.)

## Tech stack
ReactJS 18 · Vite · TypeScript · TanStack Query · Zustand · React Hook Form · Tailwind CSS + shadcn/ui · react-router · hls.js (preview player cho CM).

## Cấu trúc thư mục
```
src/
  app/            router, providers, guards (RequireAuth, RequirePermission)
  features/       auth catalog player wallet subscription rewards support
                  cms-content cms-review compliance billing-admin
                  support-desk marketing admin-users admin-risk reports
  shared/         api client (axios + interceptor refresh), ui/, hooks/, types/
```
Mỗi `features/<name>` tự chứa: `pages/`, `components/`, `hooks/`, `api.ts`, `types.ts`. Không import ngang giữa 2 feature — dùng chung qua `shared/`.

## Quy ước bắt buộc

- **Guard theo permission**, không theo role name: `<RequirePermission permission="movie:publish">`. Bám đúng ma trận phân quyền ở PROJECT_OVERVIEW.md §2.1.
- Màn hình **Approve & Publish** phim (module `cms-review`) phải hiển thị rõ trạng thái cổng tuân thủ (BR-10) — không cho bấm Publish nếu API trả về thiếu nhãn, disable nút + hiện lý do, không chỉ dựa vào lỗi 400 từ BE.
- Mọi form chạm tiền/coin (điều chỉnh ví, refund) phải gửi kèm `Idempotency-Key` và show trạng thái loading chống double-submit.
- Dùng TanStack Query cho toàn bộ data-fetching, không tự quản lý loading/error state thủ công bằng useState.
- Tuân thủ **Web Interface Guidelines** khi review UI — dùng skill `web-design-guidelines` hoặc `.claude/skills/ui-ux-review/SKILL.md` trong repo này.

## CodeGraph — bắt buộc cập nhật sau mỗi feature/fix
Repo được index bằng [CodeGraph](https://github.com/colbymchenry/codegraph) (`.codegraph/`, MCP tool `codegraph_*` / CLI `codegraph`) để tra cứu symbol, call graph, caller/callee thay vì grep thủ công. Auto-sync chạy nền qua file watcher, nhưng **ngay sau khi hoàn tất bất kỳ feature hay bug fix nào, chạy `codegraph sync` (hoặc `codegraph status` để xác nhận graph không "stale") trước khi coi task là xong** — đừng để agent sau tra cứu nhầm trên graph lệch với code thật.

## Trạng thái hiện tại
Repo mới có scaffold cấu hình, **chưa có code UI**. Xem `../PROGRESS.md`.
