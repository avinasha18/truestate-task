export function Pagination({ pagination, onPageChange }) {
  const { total, page, totalPages } = pagination;

  if (total === 0) return null;

  const getPages = () => {
    const pages = [];
    const maxShow = 6;

    if (totalPages <= maxShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (page < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 py-4 border-t border-gray-200">
      {getPages().map((p, i) => (
        p === '...' ? (
          <span key={`dot-${i}`} className="px-3 py-2 text-gray-400">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg ${page === p ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {p}
          </button>
        )
      ))}
    </div>
  );
}
