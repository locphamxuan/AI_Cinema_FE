# Quy Tắc Hoạt Động Của Antigravity (Workspace Rules — AI_Cinema_FE)

> File quy tắc này chỉ dùng ở môi trường local và được đưa vào `.gitignore`. Agent **BẮT BUỘC** tuân thủ nghiêm ngặt toàn bộ các quy tắc dưới đây trong mọi lượt tương tác và thực thi nhiệm vụ (tương thích đa máy `C:\` hoặc `D:\`).

---

## 1. Ngôn Ngữ Phản Hồi (Bắt Buộc Tiếng Việt)

- **Luôn trả lời người dùng bằng Tiếng Việt** trong mọi câu trả lời, giải thích kỹ thuật, kế hoạch thực hiện (plan), báo cáo kết quả và câu hỏi làm rõ.
- Giữ nguyên các thuật ngữ lập trình chuyên ngành, tên biến, tên hàm, tên class, đường dẫn file và câu lệnh terminal để đảm bảo tính chính xác kỹ thuật.

---

## 2. Quy Tắc Git & Commit (Bắt Buộc Mọi Thay Đổi Code / Tính Năng Mới)

- **Luôn tạo nhánh riêng trước khi sửa code (`git checkout -b <tên-nhánh>`):**
  - Trước khi sửa hoặc thêm code/tính năng mới, luôn tạo và chuyển sang nhánh riêng (`git checkout -b <feat|fix|refactor|chore>/<tên-nhánh>`) — **tuyệt đối KHÔNG** commit thẳng lên `main` hoặc `dev`.
- **Luôn chia commit theo ngữ cảnh (Atomic Commits by Context):**
  - Không gộp chung nhiều thay đổi thuộc các ngữ cảnh/tính năng khác nhau vào một commit duy nhất.
  - Phải phân tách các file thay đổi và stage (`git add <files>`) theo từng nhóm ngữ cảnh độc lập, có ý nghĩa rõ ràng (ví dụ: tách riêng commit types/service, commit component/UI, commit unit test, commit config).
  - Commit message viết tiếng Anh ngắn gọn, rõ ràng theo quy ước của repo.
- **Tuyệt đối KHÔNG bao gồm Co-author / Attribution của AI:**
  - Mọi commit được tạo ra **KHÔNG ĐƯỢC** chứa `Co-authored-by:`, logo hay bất kỳ trailer/chữ ký đồng tác giả nào của AI trong commit message.
  - Chỉ sử dụng tài khoản Git hiện tại của người dùng trong cấu hình repository.
- **Không commit các file local & dọn dẹp file tạm:**
  - Tuyệt đối không ép buộc stage (`git add -f`) các file đã nằm trong `.gitignore` như `GEMINI.md`, `CLAUDE.md`, `PROJECT_CONTEXT.md`, `PROJECT_OVERVIEW.md`, `PROGRESS.md`, `TESTING.md`, `.agents/`, `.agent/`, `.claude/`, `.codegraph/`, `.env`.
  - Sau khi hoàn tất, dọn sạch các file/thư mục/code tạm trước khi coi task là xong.

---

## 3. Quy Tắc Chạy Testing Sau Mỗi Lần Sửa Đổi, Cập Nhật

- **Bắt buộc chạy kiểm thử (Testing) sau mỗi lần sửa đổi hoặc cập nhật code:**
  - Ngay sau khi chỉnh sửa, thêm mới hoặc xóa bất kỳ đoạn code nào trong `AI_Cinema_FE`, phải chạy:
    - `npm test` (Vitest)
    - `npm run lint` (Kiểm tra ESLint + giới hạn tối đa 300 dòng/file)
    - `npx tsc --noEmit` (Kiểm tra kiểu TypeScript)
  - Viết bổ sung hoặc cập nhật unit test khi thêm tính năng mới hoặc thay đổi hành vi nghiệp vụ.
  - **Không hoàn tất nhiệm vụ và không tạo commit** nếu test hoặc lint đang bị lỗi (FAIL). Phải sửa triệt để cho đến khi toàn bộ test đều PASS.

---

## 4. Quy Tắc Duy Trì & Đồng Bộ File Ngữ Cảnh Dự Án (`PROJECT_OVERVIEW.md` & `PROJECT_CONTEXT.md`)

- **Đọc trước khi làm:** Luôn đọc [`./PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md), [`../AI_Cinema_BE/PROJECT_OVERVIEW.md`](../AI_Cinema_BE/PROJECT_OVERVIEW.md), [`../PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) và [`../docs/PROJECT_OVERVIEW.md`](../docs/PROJECT_OVERVIEW.md) trước mỗi việc.
- **Luôn cập nhật ngay sau mỗi lần sửa đổi:**
  - Ngay sau khi hoàn thành một việc trên `AI_Cinema_FE`, **bắt buộc cập nhật [`./PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md)** (mục "Nhật ký" + các mục bị ảnh hưởng) và **[`../PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md)**.
  - Không viết cứng đường dẫn ổ đĩa (`C:\` hay `D:\`) vào file `.md`. Sau khi cập nhật, chạy `powershell -ExecutionPolicy Bypass -File ../sync-context.ps1` (nếu có) để đồng bộ lên Cloud.

---

## 5. Quy Ước Kỹ Thuật Riêng Của `AI_Cinema_FE`

- Gọi API same-origin qua `/api` (rewrite trong `next.config.ts` sang BE).
- Kiểm tra điều kiện hiển thị nút thao tác theo trạng thái qua `src/features/production/lib/capabilities.ts` khớp với `project-rules.ts` của BE.
- Không sử dụng dữ liệu giả (mock/demo state) cho ví Coin, điểm danh hay gói Tháng.
