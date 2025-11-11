import { ComplianceBalance, AdjustedComplianceBalance } from '../domain/ComplianceBalance';

export interface ComplianceRepository {
  findByShipAndYear(shipId: string, year: number): Promise<ComplianceBalance | null>;
  create(cb: ComplianceBalance): Promise<ComplianceBalance>;
  update(id: string, cb: Partial<ComplianceBalance>): Promise<ComplianceBalance>;
  getAdjustedCB(shipId: string, year: number): Promise<AdjustedComplianceBalance>;
}
