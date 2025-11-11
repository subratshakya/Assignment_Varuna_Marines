import { RouteRepository } from '../ports/RouteRepository';
import { RouteComparison } from '../domain/Route';

const TARGET_INTENSITY_2025 = 89.3368;

export class CompareRoutesUseCase {
  constructor(private routeRepository: RouteRepository) {}

  async execute(): Promise<RouteComparison[]> {
    const baseline = await this.routeRepository.findBaseline();
    if (!baseline) {
      throw new Error('No baseline route found');
    }

    const allRoutes = await this.routeRepository.findAll();
    const comparisons: RouteComparison[] = [];

    for (const route of allRoutes) {
      if (route.routeId === baseline.routeId) continue;

      const percentDiff = ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100;
      const compliant = route.ghgIntensity <= TARGET_INTENSITY_2025;

      comparisons.push({
        baseline,
        comparison: route,
        percentDiff,
        compliant
      });
    }

    return comparisons;
  }
}
