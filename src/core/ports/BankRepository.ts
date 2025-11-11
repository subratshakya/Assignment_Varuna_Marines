import { BankEntry } from '../domain/BankEntry';

export interface BankRepository {
  findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]>;
  findAvailableBalance(shipId: string): Promise<number>;
  create(entry: BankEntry): Promise<BankEntry>;
  applyBanked(shipId: string, amount: number): Promise<void>;
}
