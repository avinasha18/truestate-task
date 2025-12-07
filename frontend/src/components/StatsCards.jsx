export function StatsCards({ stats, loading }) {
  const formatAmount = (amt) => {
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`;
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="flex gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="px-4 py-3 bg-white border border-gray-200 rounded-lg animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg">
        <div className="text-sm text-gray-600">Total units sold ⓘ</div>
        <div className="text-xl font-semibold mt-1">{stats.totalUnits.toLocaleString()}</div>
      </div>

      <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg">
        <div className="text-sm text-gray-600">Total Amount ⓘ</div>
        <div className="text-xl font-semibold mt-1">{formatAmount(stats.totalAmount)}</div>
      </div>

      <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-sm text-green-700">Total Discount ⓘ</div>
        <div className="text-xl font-semibold text-green-800 mt-1">{formatAmount(stats.totalDiscount)}</div>
      </div>
    </div>
  );
}
