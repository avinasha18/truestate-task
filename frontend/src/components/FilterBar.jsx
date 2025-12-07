import { useState, useRef, useEffect } from 'react';

function Dropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const displayText = selected.length > 0 ? `${label} (${selected.length})` : label;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-gray-400 bg-white"
      >
        {displayText} <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="w-4 h-4"
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function RangeDropdown({ label, minVal, maxVal, onMinChange, onMaxChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const hasVal = minVal || maxVal;
  const displayText = hasVal ? `${label} (${minVal || '0'}-${maxVal || '∞'})` : label;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-gray-400 bg-white"
      >
        {displayText} <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={minVal}
              onChange={(e) => onMinChange(e.target.value)}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              placeholder="Max"
              value={maxVal}
              onChange={(e) => onMaxChange(e.target.value)}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DateDropdown({ label, from, to, onFromChange, onToChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:border-gray-400 bg-white ${from || to ? 'border-blue-400' : 'border-gray-300'}`}
      >
        {label} <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500">From</label>
              <input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
            </div>
            <div>
              <label className="text-xs text-gray-500">To</label>
              <input type="date" value={to} onChange={(e) => onToChange(e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterBar({ filters, filterOptions, onFilterChange, onReset }) {
  if (!filterOptions) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={onReset} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg" title="Reset">
        ↻
      </button>

      <Dropdown label="Customer Region" options={filterOptions.customerRegions} selected={filters.customerRegion} onChange={(val) => onFilterChange({ customerRegion: val })} />
      <Dropdown label="Gender" options={filterOptions.genders} selected={filters.gender} onChange={(val) => onFilterChange({ gender: val })} />
      <RangeDropdown label="Age Range" minVal={filters.ageMin} maxVal={filters.ageMax} onMinChange={(val) => onFilterChange({ ageMin: val })} onMaxChange={(val) => onFilterChange({ ageMax: val })} />
      <Dropdown label="Product Category" options={filterOptions.productCategories} selected={filters.productCategory} onChange={(val) => onFilterChange({ productCategory: val })} />
      <Dropdown label="Tags" options={filterOptions.tags} selected={filters.tags} onChange={(val) => onFilterChange({ tags: val })} />
      <Dropdown label="Payment Method" options={filterOptions.paymentMethods} selected={filters.paymentMethod} onChange={(val) => onFilterChange({ paymentMethod: val })} />
      <DateDropdown label="Date" from={filters.dateFrom} to={filters.dateTo} onFromChange={(val) => onFilterChange({ dateFrom: val })} onToChange={(val) => onFilterChange({ dateTo: val })} />
    </div>
  );
}
