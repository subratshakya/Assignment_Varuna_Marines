import { Pool, PoolMember } from '../domain/Pool';

export interface PoolRepository {
  create(pool: Pool): Promise<Pool>;
  addMembers(poolId: string, members: Omit<PoolMember, 'id' | 'poolId' | 'createdAt'>[]): Promise<PoolMember[]>;
  findById(poolId: string): Promise<Pool | null>;
  findMembersByPoolId(poolId: string): Promise<PoolMember[]>;
}
