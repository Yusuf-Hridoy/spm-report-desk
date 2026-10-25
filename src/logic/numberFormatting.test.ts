import { describe, expect, it } from 'vitest';
import { parseNumberInput } from './numberFormatting';

describe('parseNumberInput', () => {
  it('reads a comma followed by 3 digits as thousands', () => {
    expect(parseNumberInput('1,200')).toBe(1200);
    expect(parseNumberInput('1,200.5')).toBe(1200.5);
    expect(parseNumberInput('1,234,567')).toBe(1234567);
  });

  it('reads a single comma as the decimal sign when it is clear', () => {
    expect(parseNumberInput('45,5')).toBe(45.5);
    expect(parseNumberInput('0,25')).toBe(0.25);
  });

  it('reads a dot as the decimal sign', () => {
    expect(parseNumberInput('1.200')).toBe(1.2);
    expect(parseNumberInput('45.5')).toBe(45.5);
    expect(parseNumberInput('120')).toBe(120);
  });

  it('returns NaN when the number is unclear', () => {
    expect(parseNumberInput('1,2,3')).toBeNaN();
    expect(parseNumberInput('1234,567')).toBeNaN();
    expect(parseNumberInput('1,20.5')).toBeNaN();
    expect(parseNumberInput('abc')).toBeNaN();
    expect(parseNumberInput('-')).toBeNaN();
  });

  it('returns null for an empty box', () => {
    expect(parseNumberInput('')).toBeNull();
    expect(parseNumberInput('   ')).toBeNull();
  });
});
