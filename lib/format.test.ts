import { describe, expect, it } from 'vitest';
import { formatGEN, parseGEN, shortAddress } from './format';

describe('format utilities', () => {
  it('parses exact 18-decimal simulated GEN amounts', () => expect(parseGEN('0.01')).toBe('10000000000000000'));
  it('rejects an undersized bond', () => expect(() => parseGEN('0.0001')).toThrow(/0.001/));
  it('formats wei without floating point precision loss', () => expect(formatGEN('6000000000000000')).toBe('0.006'));
  it('shortens addresses for presentation only', () => expect(shortAddress('0x1234567890123456789012345678901234567890')).toMatch(/^0x12345…/));
});
