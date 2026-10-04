import { describe, expect, it } from 'vitest';
import { receiptOutcome } from './chain';

describe('finalized receipt interpretation', () => {
  it('does not treat Accepted/pending as final success', () => expect(receiptOutcome({statusName:'ACCEPTED'})).toBe('pending'));
  it('requires finalized successful execution', () => expect(receiptOutcome({statusName:'FINALIZED',consensusData:{leaderReceipt:{execution_result:'SUCCESS'}}})).toBe('success'));
  it('surfaces finalized execution error', () => expect(receiptOutcome({statusName:'FINALIZED',consensusData:{leaderReceipt:{execution_result:'ERROR'}}})).toBe('error'));
  it('treats cancellation as failure', () => expect(receiptOutcome({statusName:'CANCELLED'})).toBe('error'));
});
