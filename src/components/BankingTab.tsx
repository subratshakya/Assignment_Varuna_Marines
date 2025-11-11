import { useState, useEffect } from 'react';
import { PiggyBank, ArrowDown } from 'lucide-react';
import { bankingService } from '../services/bankingService';
import { complianceService } from '../services/complianceService';
import { ComplianceBalance } from '../core/domain/ComplianceBalance';

export function BankingTab() {
  const [shipId, setShipId] = useState('SHIP001');
  const [year, setYear] = useState(2024);
  const [cb, setCb] = useState<ComplianceBalance | null>(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [applyAmount, setApplyAmount] = useState('');
  const [applyYear, setApplyYear] = useState(2025);

  useEffect(() => {
    loadData();
  }, [shipId, year]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [cbData, balance] = await Promise.all([
        complianceService.getComplianceBalance(shipId, year),
        bankingService.getAvailableBalance(shipId)
      ]);

      setCb(cbData);
      setAvailableBalance(balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleComputeCB = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const computed = await complianceService.computeComplianceBalance(
        shipId,
        year,
        91.0,
        5000
      );

      setCb(computed);
      setSuccess('Compliance balance computed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compute CB');
    } finally {
      setLoading(false);
    }
  };

  const handleBankSurplus = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (!cb || cb.cbGco2eq <= 0) {
        setError('Cannot bank negative or zero compliance balance');
        return;
      }

      await bankingService.bankSurplus(shipId, year);
      await loadData();
      setSuccess(`Successfully banked ${cb.cbGco2eq.toFixed(2)} gCO₂eq`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bank surplus');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBanked = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const amount = parseFloat(applyAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      if (amount > availableBalance) {
        setError(`Insufficient banked balance. Available: ${availableBalance.toFixed(2)}`);
        return;
      }

      await bankingService.applyBanked(shipId, applyYear, amount);
      await loadData();
      setSuccess(`Successfully applied ${amount.toFixed(2)} gCO₂eq to year ${applyYear}`);
      setApplyAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply banked surplus');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ship Selection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ship ID
            </label>
            <input
              type="text"
              value={shipId}
              onChange={(e) => setShipId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleComputeCB}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Compute CB
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <PiggyBank className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Current CB</h3>
          </div>
          {cb ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">CB:</span>
                <span className={`font-semibold ${cb.cbGco2eq >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {cb.cbGco2eq.toFixed(2)} gCO₂eq
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Target Intensity:</span>
                <span className="font-medium">{cb.targetIntensity.toFixed(4)} gCO₂e/MJ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Actual Intensity:</span>
                <span className="font-medium">{cb.actualIntensity.toFixed(4)} gCO₂e/MJ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Energy in Scope:</span>
                <span className="font-medium">{cb.energyInScope.toFixed(2)} MJ</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No CB data available. Compute CB first.</div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Banked Balance</h3>
          <div className="text-3xl font-bold text-blue-600 mb-4">
            {availableBalance.toFixed(2)} <span className="text-lg text-gray-600">gCO₂eq</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Surplus</h3>
          <p className="text-sm text-gray-600 mb-4">
            Bank your positive compliance balance for future use. This allows you to apply the surplus to deficit years later.
          </p>
          <button
            onClick={handleBankSurplus}
            disabled={loading || !cb || cb.cbGco2eq <= 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bank Current Surplus
          </button>
          {cb && cb.cbGco2eq <= 0 && (
            <p className="mt-2 text-xs text-red-600">
              Cannot bank negative or zero CB
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply Banked Surplus</h3>
          <p className="text-sm text-gray-600 mb-4">
            Apply your banked surplus to a deficit year to improve compliance.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (gCO₂eq)
              </label>
              <input
                type="number"
                value={applyAmount}
                onChange={(e) => setApplyAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Year
              </label>
              <input
                type="number"
                value={applyYear}
                onChange={(e) => setApplyYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleApplyBanked}
              disabled={loading || availableBalance <= 0 || !applyAmount}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowDown className="w-4 h-4" />
              Apply Banked Surplus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
