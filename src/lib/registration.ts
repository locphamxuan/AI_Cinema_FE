/** Sign-up rules the backend enforces (RegisterRequestDto), checked first so the form answers at once. */
export const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export const PASSWORD_HINT = `Mật khẩu ${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} ký tự, có ít nhất một chữ cái và một chữ số.`;

/** The backend's password rule (sign-up, and passwords the Admin sets). */
export function passwordValid(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH && PASSWORD_RULE.test(password);
}

