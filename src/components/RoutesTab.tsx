import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { routeService } from '../services/routeService';
import { Route } from '../core/domain/Route';

export function RoutesTab() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vesselTypeFilter, setVesselTypeFilter] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [routes, vesselTypeFilter, fuelTypeFilter, yearFilter]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await routeService.getAllRoutes();
      setRoutes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = routes;

    if (vesselTypeFilter) {
      filtered = filtered.filter(r => r.vesselType === vesselTypeFilter);
    }

    if (fuelTypeFilter) {
      filtered = filtered.filter(r => r.fuelType === fuelTypeFilter);
    }

    if (yearFilter) {
      filtered = filtered.filter(r => r.year === parseInt(yearFilter));
    }

    setFilteredRoutes(filtered);
  };

  const handleSetBaseline = async (routeId: string) => {
    try {
      await routeService.setBaseline(routeId);
      await loadRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set baseline');
    }
  };

  const vesselTypes = Array.from(new Set(routes.map(r => r.vesselType)));
  const fuelTypes = Array.from(new Set(routes.map(r => r.fuelType)));
  const years = Array.from(new Set(routes.map(r => r.year))).sort();

  if (loading) {
    return <div className="p-6 text-gray-600">Loading routes...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vessel Type
          </label>
          <select
            value={vesselTypeFilter}
            onChange={(e) => setVesselTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            {vesselTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fuel Type
          </label>
          <select
            value={fuelTypeFilter}
            onChange={(e) => setFuelTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            {fuelTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vessel Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuel Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GHG Intensity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuel Consumption</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Emissions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRoutes.map(route => (
              <tr key={route.id} className={route.isBaseline ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {route.routeId}
                  {route.isBaseline && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Baseline
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{route.vesselType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{route.fuelType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{route.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{route.ghgIntensity.toFixed(4)} gCO₂e/MJ</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{route.fuelConsumption.toFixed(2)} t</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{route.distance.toFixed(2)} km</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{route.totalEmissions.toFixed(2)} t</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {!route.isBaseline && (
                    <button
                      onClick={() => handleSetBaseline(route.routeId)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Set Baseline
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRoutes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No routes match the selected filters
          </div>
        )}
      </div>
    </div>
  );
}
