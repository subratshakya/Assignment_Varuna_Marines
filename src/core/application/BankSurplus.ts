import { BankRepository } from '../ports/BankRepository';
import { ComplianceRepository } from '../ports/ComplianceRepository';
import { BankEntry } from '../domain/BankEntry';

export class BankSurplusUseCase {
  constructor(
    private bankRepository: BankRepository,
    private complianceRepository: ComplianceRepository
  ) {}

  async execute(shipId: string, year: number): Promise<BankEntry> {
    const cb = await this.complianceRepository.findByShipAndYear(shipId, year);

    if (!cb) {
      throw new Error('No compliance balance found for ship and year');
    }

    if (cb.cbGco2eq <= 0) {
      throw new Error('Cannot bank negative or zero compliance balance');
    }

    const bankEntry: BankEntry = {
      shipId,
      year,
      amountGco2eq: cb.cbGco2eq,
      remainingGco2eq: cb.cbGco2eq
    };

    return await this.bankRepository.create(bankEntry);
  }
}
