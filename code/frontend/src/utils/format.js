export const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v));

export const dateTime = (v) =>
  new Date(v).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export const STATUS_LABEL = {
  pending: 'Pending', paid: 'Paid', payment_failed: 'Payment failed', processing: 'Processing',
  shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
};

export const STATUS_TONE = {
  pending: 'amber', paid: 'blue', payment_failed: 'red', processing: 'blue',
  shipped: 'indigo', delivered: 'green', cancelled: 'slate',
};

export function luhnFreeCardFormat(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

/** Client-side mirror of the server card/address rules (BR-P1, BR-O6). */
export function validateCard({ number, expiry, cvc }) {
  const e = {};
  if (!/^\d{16}$/.test(number.replace(/\s/g, ''))) e.number = 'Card number must be 16 digits';
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry);
  if (!m) e.expiry = 'Use MM/YY';
  else {
    const now = new Date();
    if (2000 + Number(m[2]) < now.getFullYear() || (2000 + Number(m[2]) === now.getFullYear() && Number(m[1]) < now.getMonth() + 1))
      e.expiry = 'Card has expired';
  }
  if (!/^\d{3,4}$/.test(cvc)) e.cvc = 'CVC must be 3-4 digits';
  return e;
}

export function validateAddress(a) {
  const e = {};
  if (!a.full_name.trim()) e.full_name = 'Required';
  if (!a.line1.trim()) e.line1 = 'Required';
  if (!a.city.trim()) e.city = 'Required';
  if (!a.state.trim()) e.state = 'Required';
  if (!/^[A-Za-z0-9 -]{3,10}$/.test(a.postal_code)) e.postal_code = '3-10 letters or digits';
  if (a.country.trim().length < 2) e.country = 'Required';
  if (a.phone && !/^\d{7,15}$/.test(a.phone)) e.phone = '7-15 digits';
  return e;
}

export function validateEmail(v) {
  return /^\S+@\S+\.\S+$/.test(v) ? '' : 'Enter a valid email';
}

export function validatePassword(v) {
  if (v.length < 8 || v.length > 72) return 'Use 8-72 characters';
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Include a letter and a digit';
  return '';
}
