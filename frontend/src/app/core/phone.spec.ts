import { formatPhone, isValidPhone, phoneHref } from './phone';

describe('formatPhone', () => {
  it('upisuje srpske brojeve kao +381 xx xxxxxxx', () => {
    expect(formatPhone('060 33 555 31')).toBe('+381 60 3355531');
    expect(formatPhone('381 60 33 555 31')).toBe('+381 60 3355531');
    expect(formatPhone('+381 (0)60 33-555-31')).toBe('+381 60 3355531');
    expect(formatPhone('00381 64 123 4567')).toBe('+381 64 1234567');
    expect(formatPhone('011 3613 734')).toBe('+381 11 3613734');
  });

  it('ostavlja strane brojeve sa + i odbija neispravne', () => {
    expect(formatPhone('+49 151 2345 6789')).toBe('+4915123456789');
    expect(formatPhone('060123')).toBeNull();
    expect(isValidPhone('')).toBe(true);
    expect(isValidPhone('telefon')).toBe(false);
  });

  it('pravi tel: link sa +381', () => {
    expect(phoneHref('+381 60 3355531')).toBe('tel:+381603355531');
    expect(phoneHref('381 60 33 555 31')).toBe('tel:+381603355531');
  });
});
