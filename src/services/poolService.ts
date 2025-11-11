import { SupabasePoolRepository } from '../adapters/SupabasePoolRepository';
import { CreatePoolUseCase } from '../core/application/CreatePool';
import { CreatePoolRequest, Pool, PoolMember } from '../core/domain/Pool';

const poolRepository = new SupabasePoolRepository();

export const poolService = {
  async createPool(request: CreatePoolRequest): Promise<{ pool: Pool; members: PoolMember[] }> {
    const createPoolUseCase = new CreatePoolUseCase(poolRepository);
    return await createPoolUseCase.execute(request);
  },

  async getPoolMembers(poolId: string): Promise<PoolMember[]> {
    return await poolRepository.findMembersByPoolId(poolId);
  }
};
