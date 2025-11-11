import { BankRepository } from '../ports/BankRepository';
import { ComplianceRepository } from '../ports/ComplianceRepository';

export class ApplyBankedUseCase {
  constructor(
    private bankRepository: BankRepository,
    private complianceRepository: ComplianceRepository
  ) {}

  async execute(shipId: string, targetYear: number, amount: number): Promise<void> {
    const availableBalance = await this.bankRepository.findAvailableBalance(shipId);

    if (amount > availableBalance) {
      throw new Error(`Insufficient banked balance. Available: ${availableBalance}, Requested: ${amount}`);
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    await this.bankRepository.applyBanked(shipId, amount);

    const cb = await this.complianceRepository.findByShipAndYear(shipId, targetYear);
    if (cb) {
      await this.complianceRepository.update(cb.id!, {
        cbGco2eq: cb.cbGco2eq + amount
      });
    }
  }
}
