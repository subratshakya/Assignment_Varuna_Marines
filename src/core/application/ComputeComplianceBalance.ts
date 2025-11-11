import { ComplianceRepository } from '../ports/ComplianceRepository';
import { ComplianceBalance } from '../domain/ComplianceBalance';

const TARGET_INTENSITY_2025 = 89.3368;
const ENERGY_CONVERSION_FACTOR = 41000;

export class ComputeComplianceBalanceUseCase {
  constructor(private complianceRepository: ComplianceRepository) {}

  async execute(
    shipId: string,
    year: number,
    actualIntensity: number,
    fuelConsumption: number
  ): Promise<ComplianceBalance> {
    const energyInScope = fuelConsumption * ENERGY_CONVERSION_FACTOR;

    const cbGco2eq = (TARGET_INTENSITY_2025 - actualIntensity) * energyInScope;

    const existing = await this.complianceRepository.findByShipAndYear(shipId, year);

    const cbData: ComplianceBalance = {
      shipId,
      year,
      cbGco2eq,
      targetIntensity: TARGET_INTENSITY_2025,
      actualIntensity,
      energyInScope
    };

    if (existing) {
      return await this.complianceRepository.update(existing.id!, cbData);
    } else {
      return await this.complianceRepository.create(cbData);
    }
  }
}
