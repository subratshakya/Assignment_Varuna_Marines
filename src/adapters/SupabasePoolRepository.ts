import { PoolRepository } from '../core/ports/PoolRepository';
import { Pool, PoolMember } from '../core/domain/Pool';
import { supabase } from '../lib/supabase';

export class SupabasePoolRepository implements PoolRepository {
  private mapPoolFromDB(data: any): Pool {
    return {
      id: data.id,
      year: data.year,
      createdAt: new Date(data.created_at)
    };
  }

  private mapMemberFromDB(data: any): PoolMember {
    return {
      id: data.id,
      poolId: data.pool_id,
      shipId: data.ship_id,
      cbBefore: parseFloat(data.cb_before),
      cbAfter: parseFloat(data.cb_after),
      createdAt: new Date(data.created_at)
    };
  }

  async create(pool: Pool): Promise<Pool> {
    const { data, error } = await supabase
      .from('pools')
      .insert({ year: pool.year })
      .select()
      .single();

    if (error) throw error;
    return this.mapPoolFromDB(data);
  }

  async addMembers(
    poolId: string,
    members: Omit<PoolMember, 'id' | 'poolId' | 'createdAt'>[]
  ): Promise<PoolMember[]> {
    const membersData = members.map(m => ({
      pool_id: poolId,
      ship_id: m.shipId,
      cb_before: m.cbBefore,
      cb_after: m.cbAfter
    }));

    const { data, error } = await supabase
      .from('pool_members')
      .insert(membersData)
      .select();

    if (error) throw error;
    return data?.map(d => this.mapMemberFromDB(d)) || [];
  }

  async findById(poolId: string): Promise<Pool | null> {
    const { data, error } = await supabase
      .from('pools')
      .select('*')
      .eq('id', poolId)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapPoolFromDB(data) : null;
  }

  async findMembersByPoolId(poolId: string): Promise<PoolMember[]> {
    const { data, error } = await supabase
      .from('pool_members')
      .select('*')
      .eq('pool_id', poolId);

    if (error) throw error;
    return data?.map(d => this.mapMemberFromDB(d)) || [];
  }
}
