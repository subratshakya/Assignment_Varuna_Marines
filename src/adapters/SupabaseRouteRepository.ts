import { RouteRepository } from '../core/ports/RouteRepository';
import { Route } from '../core/domain/Route';
import { supabase } from '../lib/supabase';

export class SupabaseRouteRepository implements RouteRepository {
  private mapFromDB(data: any): Route {
    return {
      id: data.id,
      routeId: data.route_id,
      vesselType: data.vessel_type,
      fuelType: data.fuel_type,
      year: data.year,
      ghgIntensity: parseFloat(data.ghg_intensity),
      fuelConsumption: parseFloat(data.fuel_consumption),
      distance: parseFloat(data.distance),
      totalEmissions: parseFloat(data.total_emissions),
      isBaseline: data.is_baseline,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapToDB(route: Route): any {
    return {
      route_id: route.routeId,
      vessel_type: route.vesselType,
      fuel_type: route.fuelType,
      year: route.year,
      ghg_intensity: route.ghgIntensity,
      fuel_consumption: route.fuelConsumption,
      distance: route.distance,
      total_emissions: route.totalEmissions,
      is_baseline: route.isBaseline
    };
  }

  async findAll(): Promise<Route[]> {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .order('year', { ascending: true });

    if (error) throw error;
    return data?.map(d => this.mapFromDB(d)) || [];
  }

  async findById(id: string): Promise<Route | null> {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapFromDB(data) : null;
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('route_id', routeId)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapFromDB(data) : null;
  }

  async findBaseline(): Promise<Route | null> {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('is_baseline', true)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapFromDB(data) : null;
  }

  async setBaseline(routeId: string): Promise<Route> {
    await supabase
      .from('routes')
      .update({ is_baseline: false })
      .eq('is_baseline', true);

    const { data, error } = await supabase
      .from('routes')
      .update({ is_baseline: true, updated_at: new Date().toISOString() })
      .eq('route_id', routeId)
      .select()
      .single();

    if (error) throw error;
    return this.mapFromDB(data);
  }

  async create(route: Route): Promise<Route> {
    const { data, error } = await supabase
      .from('routes')
      .insert(this.mapToDB(route))
      .select()
      .single();

    if (error) throw error;
    return this.mapFromDB(data);
  }

  async update(id: string, route: Partial<Route>): Promise<Route> {
    const updateData: any = {};
    if (route.vesselType !== undefined) updateData.vessel_type = route.vesselType;
    if (route.fuelType !== undefined) updateData.fuel_type = route.fuelType;
    if (route.year !== undefined) updateData.year = route.year;
    if (route.ghgIntensity !== undefined) updateData.ghg_intensity = route.ghgIntensity;
    if (route.fuelConsumption !== undefined) updateData.fuel_consumption = route.fuelConsumption;
    if (route.distance !== undefined) updateData.distance = route.distance;
    if (route.totalEmissions !== undefined) updateData.total_emissions = route.totalEmissions;
    if (route.isBaseline !== undefined) updateData.is_baseline = route.isBaseline;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('routes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapFromDB(data);
  }
}
