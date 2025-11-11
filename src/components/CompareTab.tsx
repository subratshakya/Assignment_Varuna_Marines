import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { routeService } from '../services/routeService';
import { RouteComparison } from '../core/domain/Route';

const TARGET_INTENSITY = 89.3368;

export function CompareTab() {
  const [comparisons, setComparisons] = useState<RouteComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComparisons();
  }, []);

  const loadComparisons = async () => {
    try {
      setLoading(true);
      const data = await routeService.getComparison();
      setComparisons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparisons');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Loading comparisons...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (comparisons.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No baseline route set. Please set a baseline in the Routes tab first.
      </div>
    );
  }

  const baseline = comparisons[0].baseline;

  return (
    <div className="p-6">
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Baseline Route</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Route ID:</span>{' '}
            <span className="font-medium">{baseline.routeId}</span>
          </div>
          <div>
            <span className="text-gray-600">Vessel:</span>{' '}
            <span className="font-medium">{baseline.vesselType}</span>
          </div>
          <div>
            <span className="text-gray-600">Fuel:</span>{' '}
            <span className="font-medium">{baseline.fuelType}</span>
          </div>
          <div>
            <span className="text-gray-600">GHG Intensity:</span>{' '}
            <span className="font-medium">{baseline.ghgIntensity.toFixed(4)} gCO₂e/MJ</span>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Target Intensity (2% below baseline): <span className="font-medium">{TARGET_INTENSITY.toFixed(4)} gCO₂e/MJ</span>
        </div>
      </div>

      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vessel Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuel Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GHG Intensity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Difference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {comparisons.map(comp => (
              <tr key={comp.comparison.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {comp.comparison.routeId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {comp.comparison.vesselType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {comp.comparison.fuelType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {comp.comparison.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {comp.comparison.ghgIntensity.toFixed(4)} gCO₂e/MJ
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  comp.percentDiff < 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {comp.percentDiff > 0 ? '+' : ''}{comp.percentDiff.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {comp.compliant ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      Compliant
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600">
                      <XCircle className="w-5 h-5" />
                      Non-compliant
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">GHG Intensity Comparison</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium text-gray-700">Baseline</div>
            <div className="flex-1">
              <div className="h-8 bg-blue-500 rounded flex items-center justify-end pr-3 text-white text-sm font-medium"
                   style={{ width: '100%' }}>
                {baseline.ghgIntensity.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium text-gray-700">Target</div>
            <div className="flex-1">
              <div className="h-8 bg-gray-400 rounded flex items-center justify-end pr-3 text-white text-sm font-medium"
                   style={{ width: `${(TARGET_INTENSITY / baseline.ghgIntensity) * 100}%` }}>
                {TARGET_INTENSITY.toFixed(2)}
              </div>
            </div>
          </div>
          {comparisons.map(comp => (
            <div key={comp.comparison.id} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700 truncate">
                {comp.comparison.routeId}
              </div>
              <div className="flex-1">
                <div className={`h-8 rounded flex items-center justify-end pr-3 text-white text-sm font-medium ${
                  comp.compliant ? 'bg-green-500' : 'bg-red-500'
                }`} style={{ width: `${(comp.comparison.ghgIntensity / baseline.ghgIntensity) * 100}%` }}>
                  {comp.comparison.ghgIntensity.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
