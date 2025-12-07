import { useSalesData } from './hooks/useSalesData';
import { Sidebar } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { FilterBar } from './components/FilterBar';
import { SortDropdown } from './components/SortDropdown';
import { StatsCards } from './components/StatsCards';
import { TransactionTable } from './components/TransactionTable';
import { Pagination } from './components/Pagination';

function App() {
  const {
    data, pagination, stats, loading, error,
    search, filters, sortBy, sortOrder, filterOptions,
    updateSearch, updateFilters, updateSort, goToPage, resetFilters
  } = useSalesData();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Sales Management System</h1>
            <SearchBar value={search} onChange={updateSearch} />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <FilterBar filters={filters} filterOptions={filterOptions} onFilterChange={updateFilters} onReset={resetFilters} />
            <SortDropdown sortBy={sortBy} sortOrder={sortOrder} onChange={updateSort} />
          </div>

          <div className="mb-4">
            <StatsCards stats={stats} loading={loading} />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <TransactionTable data={data} loading={loading} error={error} />
            <Pagination pagination={pagination} onPageChange={goToPage} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
