/** Sign-up rules the backend enforces (RegisterRequestDto), checked first so the form answers at once. */
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72;
/** BR-54: Members must be at least this old. */
export const MIN_MEMBER_AGE = 18;

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export const PASSWORD_HINT = `Mật khẩu ${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} ký tự, có ít nhất một chữ cái và một chữ số.`;

/** The backend's password rule (sign-up, and passwords the Admin sets). */
export function passwordValid(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH && PASSWORD_RULE.test(password);
}

/** The latest date of birth that is old enough today, as YYYY-MM-DD (the date input's `max`). */
export function latestAdultBirthDate(today: Date = new Date()): string {
  const cutoff = new Date(today.getFullYear() - MIN_MEMBER_AGE, today.getMonth(), today.getDate());
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${cutoff.getFullYear()}-${pad(cutoff.getMonth() + 1)}-${pad(cutoff.getDate())}`;
}

/** The first problem of a sign-up, in Vietnamese, or null when the backend will accept it. */
export function registrationError(password: string, dateOfBirth: string, today: Date = new Date()): string | null {
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return `Mật khẩu cần từ ${MIN_PASSWORD_LENGTH} đến ${MAX_PASSWORD_LENGTH} ký tự.`;
  }
  if (!PASSWORD_RULE.test(password)) return 'Mật khẩu cần có ít nhất một chữ cái và một chữ số.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return 'Vui lòng nhập ngày sinh.';
  if (dateOfBirth > latestAdultBirthDate(today)) {
    return `AI Cinema dành cho người từ ${MIN_MEMBER_AGE} tuổi trở lên.`;
  }
  return null;
}
