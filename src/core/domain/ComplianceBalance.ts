export interface ComplianceBalance {
  id?: string;
  shipId: string;
  year: number;
  cbGco2eq: number;
  targetIntensity: number;
  actualIntensity: number;
  energyInScope: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdjustedComplianceBalance {
  shipId: string;
  year: number;
  originalCB: number;
  bankedApplied: number;
  adjustedCB: number;
}
