import { useState } from 'react';
import { Ship } from 'lucide-react';
import { RoutesTab } from './components/RoutesTab';
import { CompareTab } from './components/CompareTab';
import { BankingTab } from './components/BankingTab';
import { PoolingTab } from './components/PoolingTab';

type Tab = 'routes' | 'compare' | 'banking' | 'pooling';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('routes');

  const tabs = [
    { id: 'routes' as Tab, label: 'Routes' },
    { id: 'compare' as Tab, label: 'Compare' },
    { id: 'banking' as Tab, label: 'Banking' },
    { id: 'pooling' as Tab, label: 'Pooling' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Ship className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FuelEU Maritime</h1>
                <p className="text-xs text-gray-600">Compliance Platform</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div>
            {activeTab === 'routes' && <RoutesTab />}
            {activeTab === 'compare' && <CompareTab />}
            {activeTab === 'banking' && <BankingTab />}
            {activeTab === 'pooling' && <PoolingTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
