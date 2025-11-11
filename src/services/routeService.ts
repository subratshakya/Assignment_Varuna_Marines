import { SupabaseRouteRepository } from '../adapters/SupabaseRouteRepository';
import { CompareRoutesUseCase } from '../core/application/CompareRoutes';
import { Route, RouteComparison } from '../core/domain/Route';

const routeRepository = new SupabaseRouteRepository();

export const routeService = {
  async getAllRoutes(): Promise<Route[]> {
    return await routeRepository.findAll();
  },

  async setBaseline(routeId: string): Promise<Route> {
    return await routeRepository.setBaseline(routeId);
  },

  async getComparison(): Promise<RouteComparison[]> {
    const compareUseCase = new CompareRoutesUseCase(routeRepository);
    return await compareUseCase.execute();
  }
};
