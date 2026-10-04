export type PactStatus = 'PROPOSED' | 'ACTIVE' | 'CANCELLED' | 'CLOSED';
export type PeriodStatus = 'FUNDED' | 'INCONCLUSIVE' | 'SETTLED' | 'EXPIRED_UNRESOLVED';
export type Classification = 'NO_BREACH' | 'MINOR' | 'MAJOR' | 'SEVERE' | 'INCONCLUSIVE';

export type EvidenceSource = {
  id: string;
  role: 'PROVIDER' | 'INDEPENDENT' | 'MAINTENANCE';
  url: string;
  scope: string;
};

export type Pact = {
  id: string;
  title: string;
  service: string;
  service_scope?: string;
  customer: string;
  provider: string;
  status: PactStatus;
  period_count: number;
  period_seconds: number;
  bond: string;
  created_at?: number;
  activated_at?: number;
  closed_at?: number;
  terms_hash?: string;
  sla_clauses?: string[];
  tier_rules?: { minor: string; major: string; severe: string };
  customer_bps?: { minor: number; major: number; severe: number };
  sources?: EvidenceSource[];
};

export type SourceFinding = {
  id: string;
  state: 'BREACH' | 'NO_BREACH' | 'MIXED' | 'NEUTRAL' | 'UNAVAILABLE';
  reason: string;
  quote: string;
};

export type Assessment = {
  classification: Classification;
  source_findings: SourceFinding[];
  exclusion: { status: 'APPLIES' | 'DOES_NOT_APPLY' | 'UNCLEAR' | 'NOT_RELEVANT'; reason: string };
  timeline: { at: string; source_id: string; event: string }[];
  reason: string;
  evidence: { id: string; role: string; url: string; available: boolean; http_status: number; sha256: string; bytes: number }[];
  period_start: number;
  period_end: number;
};

export type Period = {
  pact_id: string;
  index: number;
  status: PeriodStatus;
  funded_at: number;
  started_at: number;
  ends_at: number;
  evidence_deadline: number;
  bond: string;
  assessment_attempts: number;
  classification: Classification | '';
  assessment: Assessment | null;
  settled_at: number;
  customer_credit: string;
  provider_credit: string;
};

export type Deployment = {
  verified: boolean;
  address: string | null;
  chainId: number;
  network: 'studionet';
  version: string;
  sourceSha256: string;
  deploymentTransaction: string;
  note?: string;
};

export type WalletSession = {
  address: `0x${string}`;
  provider: Eip1193Provider;
};

export type Eip1193Provider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  providers?: Eip1193Provider[];
};

export type PendingTx = {
  hash: `0x${string}`;
  method: string;
  pactId: string;
  account: string;
  submittedAt: number;
};
