export type Errors<T extends string = string> = Partial<Record<T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(v: string): string | undefined {
  return EMAIL_RE.test(v.trim()) ? undefined : "Enter a valid email address.";
}

export function validatePassword(v: string): string | undefined {
  return v.length >= 8 ? undefined : "Password must be at least 8 characters.";
}

export function validateRegister(f: { name: string; email: string; password: string }) {
  const e: Errors<"name" | "email" | "password"> = {};
  if (!f.name.trim()) e.name = "Name is required.";
  const em = validateEmail(f.email); if (em) e.email = em;
  const pw = validatePassword(f.password); if (pw) e.password = pw;
  return e;
}

export function luhnValid(digits: string): boolean {
  let sum = 0; let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return digits.length > 0 && sum % 10 === 0;
}

export function validateCard(
  f: { number: string; expiry: string; cvc: string }, now: Date = new Date(),
) {
  const e: Errors<"number" | "expiry" | "cvc"> = {};
  const digits = f.number.replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(digits) || !luhnValid(digits)) e.number = "Enter a valid card number.";
  const m = /^(\d{2})\/(\d{2})$/.exec(f.expiry.trim());
  if (!m) e.expiry = "Use MM/YY.";
  else {
    const month = Number(m[1]); const year = 2000 + Number(m[2]);
    if (month < 1 || month > 12) e.expiry = "Invalid month.";
    else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) e.expiry = "Card has expired.";
  }
  if (!/^\d{3,4}$/.test(f.cvc)) e.cvc = "Enter 3 or 4 digits.";
  return e;
}

export function validatePlan(f: { name: string; price: string }) {
  const e: Errors<"name" | "price"> = {};
  if (!f.name.trim()) e.name = "Name is required.";
  const p = Number(f.price);
  if (f.price.trim() === "" || Number.isNaN(p) || p < 0) e.price = "Enter a price of 0 or more.";
  return e;
}

export const hasErrors = (e: object) => Object.keys(e).length > 0;
