export const shortAddress = (value?: string | null) => {
  if (!value) return '—';
  return value.length > 14 ? `${value.slice(0, 7)}…${value.slice(-5)}` : value;
};

export const formatGEN = (wei: string | bigint | number) => {
  const value = typeof wei === 'bigint' ? wei : BigInt(wei || 0);
  const whole = value / 10n ** 18n;
  const fraction = (value % 10n ** 18n).toString().padStart(18, '0').replace(/0+$/, '').slice(0, 6);
  return fraction ? `${whole}.${fraction}` : whole.toString();
};

export const parseGEN = (value: string) => {
  if (!/^\d+(\.\d{1,18})?$/.test(value)) throw new Error('Use a decimal GEN amount with at most 18 decimal places.');
  const [whole, fraction = ''] = value.split('.');
  const wei = BigInt(whole) * 10n ** 18n + BigInt(fraction.padEnd(18, '0'));
  if (wei < 10n ** 15n || wei > 10n ** 18n) throw new Error('Period bond must be between 0.001 and 1 simulated GEN.');
  return wei.toString();
};

export const formatDate = (timestamp?: number) => {
  if (!timestamp) return '—';
  return new Date(timestamp * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

export const classificationLabel: Record<string, string> = {
  NO_BREACH: 'No breach',
  MINOR: 'Minor breach',
  MAJOR: 'Major breach',
  SEVERE: 'Severe breach',
  INCONCLUSIVE: 'Inconclusive',
};
