import { SupabaseComplianceRepository } from '../adapters/SupabaseComplianceRepository';
import { ComputeComplianceBalanceUseCase } from '../core/application/ComputeComplianceBalance';
import { ComplianceBalance, AdjustedComplianceBalance } from '../core/domain/ComplianceBalance';

const complianceRepository = new SupabaseComplianceRepository();

export const complianceService = {
  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance | null> {
    return await complianceRepository.findByShipAndYear(shipId, year);
  },

  async computeComplianceBalance(
    shipId: string,
    year: number,
    actualIntensity: number,
    fuelConsumption: number
  ): Promise<ComplianceBalance> {
    const computeUseCase = new ComputeComplianceBalanceUseCase(complianceRepository);
    return await computeUseCase.execute(shipId, year, actualIntensity, fuelConsumption);
  },

  async getAdjustedCB(shipId: string, year: number): Promise<AdjustedComplianceBalance> {
    return await complianceRepository.getAdjustedCB(shipId, year);
  }
};
