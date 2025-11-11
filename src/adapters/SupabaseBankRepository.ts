import { BankRepository } from '../core/ports/BankRepository';
import { BankEntry } from '../core/domain/BankEntry';
import { supabase } from '../lib/supabase';

export class SupabaseBankRepository implements BankRepository {
  private mapFromDB(data: any): BankEntry {
    return {
      id: data.id,
      shipId: data.ship_id,
      year: data.year,
      amountGco2eq: parseFloat(data.amount_gco2eq),
      remainingGco2eq: parseFloat(data.remaining_gco2eq),
      createdAt: new Date(data.created_at)
    };
  }

  private mapToDB(entry: BankEntry): any {
    return {
      ship_id: entry.shipId,
      year: entry.year,
      amount_gco2eq: entry.amountGco2eq,
      remaining_gco2eq: entry.remainingGco2eq
    };
  }

  async findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]> {
    const { data, error } = await supabase
      .from('bank_entries')
      .select('*')
      .eq('ship_id', shipId)
      .eq('year', year);

    if (error) throw error;
    return data?.map(d => this.mapFromDB(d)) || [];
  }

  async findAvailableBalance(shipId: string): Promise<number> {
    const { data, error } = await supabase
      .from('bank_entries')
      .select('remaining_gco2eq')
      .eq('ship_id', shipId);

    if (error) throw error;

    return data?.reduce((sum, entry) => sum + parseFloat(entry.remaining_gco2eq), 0) || 0;
  }

  async create(entry: BankEntry): Promise<BankEntry> {
    const { data, error } = await supabase
      .from('bank_entries')
      .insert(this.mapToDB(entry))
      .select()
      .single();

    if (error) throw error;
    return this.mapFromDB(data);
  }

  async applyBanked(shipId: string, amount: number): Promise<void> {
    const { data: entries, error: fetchError } = await supabase
      .from('bank_entries')
      .select('*')
      .eq('ship_id', shipId)
      .gt('remaining_gco2eq', 0)
      .order('year', { ascending: true });

    if (fetchError) throw fetchError;

    let remaining = amount;

    for (const entry of entries || []) {
      if (remaining <= 0) break;

      const available = parseFloat(entry.remaining_gco2eq);
      const toDeduct = Math.min(available, remaining);

      const { error: updateError } = await supabase
        .from('bank_entries')
        .update({ remaining_gco2eq: available - toDeduct })
        .eq('id', entry.id);

      if (updateError) throw updateError;

      remaining -= toDeduct;
    }
  }
}
