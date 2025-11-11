import { SupabaseBankRepository } from '../adapters/SupabaseBankRepository';
import { SupabaseComplianceRepository } from '../adapters/SupabaseComplianceRepository';
import { BankSurplusUseCase } from '../core/application/BankSurplus';
import { ApplyBankedUseCase } from '../core/application/ApplyBanked';
import { BankEntry } from '../core/domain/BankEntry';

const bankRepository = new SupabaseBankRepository();
const complianceRepository = new SupabaseComplianceRepository();

export const bankingService = {
  async getBankRecords(shipId: string, year: number): Promise<BankEntry[]> {
    return await bankRepository.findByShipAndYear(shipId, year);
  },

  async getAvailableBalance(shipId: string): Promise<number> {
    return await bankRepository.findAvailableBalance(shipId);
  },

  async bankSurplus(shipId: string, year: number): Promise<BankEntry> {
    const bankUseCase = new BankSurplusUseCase(bankRepository, complianceRepository);
    return await bankUseCase.execute(shipId, year);
  },

  async applyBanked(shipId: string, targetYear: number, amount: number): Promise<void> {
    const applyUseCase = new ApplyBankedUseCase(bankRepository, complianceRepository);
    return await applyUseCase.execute(shipId, targetYear, amount);
  }
};
