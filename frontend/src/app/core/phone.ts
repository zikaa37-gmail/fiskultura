export function formatPhone(value: string | null | undefined): string | null {
  const raw = (value ?? '').trim();
  if (!raw) {
    return null;
  }
  let digits = raw.replace(/\D/g, '');
  const international = raw.startsWith('+') || raw.startsWith('00');
  if (raw.startsWith('00')) {
    digits = digits.slice(2);
  }
  if (international && !digits.startsWith('381')) {
    return digits.length >= 7 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (digits.startsWith('381') && (international || digits.length >= 11)) {
    digits = digits.slice(3);
  }
  digits = digits.replace(/^0+/, '');
  if (digits.length < 8 || digits.length > 10) {
    return null;
  }
  return `+381 ${digits.slice(0, 2)} ${digits.slice(2)}`;
}

export function isValidPhone(value: string | null | undefined): boolean {
  return !(value ?? '').trim() || formatPhone(value) !== null;
}

export function phoneHref(phone: string): string {
  return `tel:${(formatPhone(phone) ?? phone).replace(/[^\d+]/g, '')}`;
}
