import { Route } from '../domain/Route';

export interface RouteRepository {
  findAll(): Promise<Route[]>;
  findById(id: string): Promise<Route | null>;
  findByRouteId(routeId: string): Promise<Route | null>;
  findBaseline(): Promise<Route | null>;
  setBaseline(routeId: string): Promise<Route>;
  create(route: Route): Promise<Route>;
  update(id: string, route: Partial<Route>): Promise<Route>;
}
