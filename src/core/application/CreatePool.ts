import { PoolRepository } from '../ports/PoolRepository';
import { CreatePoolRequest, Pool, PoolMember, PoolValidationResult } from '../domain/Pool';

export class CreatePoolUseCase {
  constructor(private poolRepository: PoolRepository) {}

  private validatePool(members: { shipId: string; cbBefore: number }[]): PoolValidationResult {
    const errors: string[] = [];

    const poolSum = members.reduce((sum, m) => sum + m.cbBefore, 0);

    if (poolSum < 0) {
      errors.push('Pool sum must be non-negative');
    }

    return {
      valid: errors.length === 0,
      errors,
      poolSum
    };
  }

  private allocatePool(members: { shipId: string; cbBefore: number }[]): { shipId: string; cbAfter: number }[] {
    const sorted = [...members].sort((a, b) => b.cbBefore - a.cbBefore);

    const result = sorted.map(m => ({ shipId: m.shipId, cbAfter: m.cbBefore }));

    for (let i = 0; i < result.length; i++) {
      if (result[i].cbAfter > 0) {
        for (let j = result.length - 1; j > i; j--) {
          if (result[j].cbAfter < 0) {
            const transfer = Math.min(result[i].cbAfter, -result[j].cbAfter);
            result[i].cbAfter -= transfer;
            result[j].cbAfter += transfer;

            if (result[i].cbAfter === 0) break;
          }
        }
      }
    }

    for (let i = 0; i < members.length; i++) {
      const original = members[i];
      const after = result.find(r => r.shipId === original.shipId)!;

      if (original.cbBefore < 0 && after.cbAfter < original.cbBefore) {
        throw new Error(`Deficit ship ${original.shipId} cannot exit worse`);
      }

      if (original.cbBefore > 0 && after.cbAfter < 0) {
        throw new Error(`Surplus ship ${original.shipId} cannot exit negative`);
      }
    }

    return result;
  }

  async execute(request: CreatePoolRequest): Promise<{ pool: Pool; members: PoolMember[] }> {
    const validation = this.validatePool(request.members);

    if (!validation.valid) {
      throw new Error(`Pool validation failed: ${validation.errors.join(', ')}`);
    }

    const allocations = this.allocatePool(request.members);

    const pool = await this.poolRepository.create({ year: request.year });

    const memberData = request.members.map(m => {
      const allocation = allocations.find(a => a.shipId === m.shipId)!;
      return {
        shipId: m.shipId,
        cbBefore: m.cbBefore,
        cbAfter: allocation.cbAfter
      };
    });

    const members = await this.poolRepository.addMembers(pool.id!, memberData);

    return { pool, members };
  }
}
