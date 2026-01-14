export interface Party {
  name: string;
  email: string;
}

export interface Agreement {
  agreementId: string;
  title: string;
  content: string;
  partyA: Party;
  partyB: Party;
  status: 'PENDING' | 'CONFIRMED';
  proofHash: string;
  shareLink: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  isImmutable: boolean;
}

export interface CreateAgreementRequest {
  title: string;
  content: string;
  partyA: Party;
  partyB: Party;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface CreateAgreementResponse {
  agreementId: string;
  shareLink: string;
  status: string;
  createdAt: string;
}

export interface AgreementStatusResponse {
  agreementId: string;
  status: string;
  confirmedAt?: string;
  isImmutable: boolean;
}