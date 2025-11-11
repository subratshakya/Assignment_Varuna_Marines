import { ComplianceRepository } from '../core/ports/ComplianceRepository';
import { ComplianceBalance, AdjustedComplianceBalance } from '../core/domain/ComplianceBalance';
import { supabase } from '../lib/supabase';

export class SupabaseComplianceRepository implements ComplianceRepository {
  private mapFromDB(data: any): ComplianceBalance {
    return {
      id: data.id,
      shipId: data.ship_id,
      year: data.year,
      cbGco2eq: parseFloat(data.cb_gco2eq),
      targetIntensity: parseFloat(data.target_intensity),
      actualIntensity: parseFloat(data.actual_intensity),
      energyInScope: parseFloat(data.energy_in_scope),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapToDB(cb: ComplianceBalance): any {
    return {
      ship_id: cb.shipId,
      year: cb.year,
      cb_gco2eq: cb.cbGco2eq,
      target_intensity: cb.targetIntensity,
      actual_intensity: cb.actualIntensity,
      energy_in_scope: cb.energyInScope
    };
  }

  async findByShipAndYear(shipId: string, year: number): Promise<ComplianceBalance | null> {
    const { data, error } = await supabase
      .from('ship_compliance')
      .select('*')
      .eq('ship_id', shipId)
      .eq('year', year)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapFromDB(data) : null;
  }

  async create(cb: ComplianceBalance): Promise<ComplianceBalance> {
    const { data, error } = await supabase
      .from('ship_compliance')
      .insert(this.mapToDB(cb))
      .select()
      .single();

    if (error) throw error;
    return this.mapFromDB(data);
  }

  async update(id: string, cb: Partial<ComplianceBalance>): Promise<ComplianceBalance> {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (cb.cbGco2eq !== undefined) updateData.cb_gco2eq = cb.cbGco2eq;
    if (cb.targetIntensity !== undefined) updateData.target_intensity = cb.targetIntensity;
    if (cb.actualIntensity !== undefined) updateData.actual_intensity = cb.actualIntensity;
    if (cb.energyInScope !== undefined) updateData.energy_in_scope = cb.energyInScope;

    const { data, error } = await supabase
      .from('ship_compliance')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapFromDB(data);
  }

  async getAdjustedCB(shipId: string, year: number): Promise<AdjustedComplianceBalance> {
    const cb = await this.findByShipAndYear(shipId, year);
    if (!cb) {
      throw new Error('No compliance balance found');
    }

    const { data: bankData, error } = await supabase
      .from('bank_entries')
      .select('remaining_gco2eq')
      .eq('ship_id', shipId);

    if (error) throw error;

    const bankedApplied = bankData?.reduce((sum, entry) => {
      return sum + (parseFloat(entry.remaining_gco2eq) - parseFloat(entry.remaining_gco2eq));
    }, 0) || 0;

    return {
      shipId,
      year,
      originalCB: cb.cbGco2eq,
      bankedApplied,
      adjustedCB: cb.cbGco2eq + bankedApplied
    };
  }
}
