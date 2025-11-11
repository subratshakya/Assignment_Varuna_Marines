import { useState } from 'react';
import { Users, Plus, X } from 'lucide-react';
import { poolService } from '../services/poolService';
import { complianceService } from '../services/complianceService';

interface PoolMemberInput {
  shipId: string;
  cbBefore: number;
}

export function PoolingTab() {
  const [year, setYear] = useState(2024);
  const [members, setMembers] = useState<PoolMemberInput[]>([
    { shipId: '', cbBefore: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdPool, setCreatedPool] = useState<any>(null);

  const addMember = () => {
    setMembers([...members, { shipId: '', cbBefore: 0 }]);
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, field: keyof PoolMemberInput, value: string | number) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const poolSum = members.reduce((sum, m) => sum + (parseFloat(String(m.cbBefore)) || 0), 0);
  const isValid = poolSum >= 0 && members.every(m => m.shipId.trim() !== '');

  const handleFetchCB = async (index: number) => {
    const member = members[index];
    if (!member.shipId.trim()) {
      setError('Please enter a ship ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const cb = await complianceService.getComplianceBalance(member.shipId, year);

      if (cb) {
        updateMember(index, 'cbBefore', cb.cbGco2eq);
      } else {
        setError(`No compliance balance found for ${member.shipId} in year ${year}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CB');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePool = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (!isValid) {
        setError('Pool validation failed. Ensure all ship IDs are filled and pool sum is non-negative.');
        return;
      }

      const validMembers = members.filter(m => m.shipId.trim() !== '');

      const result = await poolService.createPool({
        year,
        members: validMembers.map(m => ({
          shipId: m.shipId,
          cbBefore: parseFloat(String(m.cbBefore)) || 0
        }))
      });

      setCreatedPool(result);
      setSuccess('Pool created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pool');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pool Configuration</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Pool Members</h3>
          </div>
          <button
            onClick={addMember}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>

        <div className="space-y-3">
          {members.map((member, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ship ID
                </label>
                <input
                  type="text"
                  value={member.shipId}
                  onChange={(e) => updateMember(index, 'shipId', e.target.value)}
                  placeholder="SHIP001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  CB Before (gCO₂eq)
                </label>
                <input
                  type="number"
                  value={member.cbBefore}
                  onChange={(e) => updateMember(index, 'cbBefore', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-6">
                <button
                  onClick={() => handleFetchCB(index)}
                  disabled={loading}
                  className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Fetch CB
                </button>
                {members.length > 1 && (
                  <button
                    onClick={() => removeMember(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Pool Sum:</span>
            <span className={`text-lg font-bold ${poolSum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {poolSum.toFixed(2)} gCO₂eq
            </span>
          </div>

          <div className="flex items-start gap-3 mb-4 text-sm">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${poolSum >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-700">Pool sum must be non-negative</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${members.every(m => m.shipId.trim() !== '') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-700">All ship IDs must be filled</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreatePool}
            disabled={loading || !isValid}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Create Pool
          </button>
        </div>
      </div>

      {createdPool && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pool Created Successfully</h3>
          <div className="mb-4 text-sm">
            <span className="text-gray-600">Pool ID:</span>{' '}
            <span className="font-mono font-medium">{createdPool.pool.id}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ship ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CB Before</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CB After</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {createdPool.members.map((member: any) => {
                  const change = member.cbAfter - member.cbBefore;
                  return (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.shipId}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${member.cbBefore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {member.cbBefore.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${member.cbAfter >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {member.cbAfter.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Pooling Rules (Article 21)</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Sum of adjusted CB must be non-negative</li>
          <li>Deficit ships cannot exit worse than they entered</li>
          <li>Surplus ships cannot exit with negative CB</li>
          <li>Greedy allocation: surplus distributed to deficits in order</li>
        </ul>
      </div>
    </div>
  );
}
