export interface Pool {
  id?: string;
  year: number;
  createdAt?: Date;
}

export interface PoolMember {
  id?: string;
  poolId: string;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
  createdAt?: Date;
}

export interface CreatePoolRequest {
  year: number;
  members: {
    shipId: string;
    cbBefore: number;
  }[];
}

export interface PoolValidationResult {
  valid: boolean;
  errors: string[];
  poolSum?: number;
}
