import { useState, useRef, useEffect } from 'react';

const sortOptions = [
  { key: 'customerName-asc', label: 'Customer Name (A-Z)', field: 'customerName', order: 'asc' },
  { key: 'customerName-desc', label: 'Customer Name (Z-A)', field: 'customerName', order: 'desc' },
  { key: 'date-desc', label: 'Date (Newest)', field: 'date', order: 'desc' },
  { key: 'date-asc', label: 'Date (Oldest)', field: 'date', order: 'asc' },
  { key: 'quantity-desc', label: 'Quantity (High-Low)', field: 'quantity', order: 'desc' },
  { key: 'quantity-asc', label: 'Quantity (Low-High)', field: 'quantity', order: 'asc' }
];

export function SortDropdown({ sortBy, sortOrder, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentKey = `${sortBy}-${sortOrder}`;
  const currentLabel = sortOptions.find(o => o.key === currentKey)?.label || 'Sort by';

  const handleSelect = (opt) => {
    onChange(opt.field, opt.order);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-gray-400 bg-white">
        Sort by: {currentLabel} <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {sortOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => handleSelect(opt)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${currentKey === opt.key ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
