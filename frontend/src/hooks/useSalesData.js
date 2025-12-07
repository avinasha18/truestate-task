import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTransactions, fetchFilterOptions } from '../services/api';

const defaultFilters = {
  customerRegion: [],
  gender: [],
  ageMin: '',
  ageMax: '',
  productCategory: [],
  tags: [],
  paymentMethod: [],
  dateFrom: '',
  dateTo: ''
};

export function useSalesData() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, pageSize: 10 });
  const [stats, setStats] = useState({ totalUnits: 0, totalAmount: 0, totalDiscount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [filterOptions, setFilterOptions] = useState(null);

  const timer = useRef(null);

  useEffect(() => {
    fetchFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(loadData, 300);
    return () => clearTimeout(timer.current);
  }, [search, filters, sortBy, sortOrder, page]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTransactions({ search, ...filters, sortBy, sortOrder, page });
      setData(result.data);
      setPagination(result.pagination);
      setStats(result.stats || { totalUnits: 0, totalAmount: 0, totalDiscount: 0 });
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  const updateSearch = useCallback((val) => { setSearch(val); setPage(1); }, []);
  const updateFilters = useCallback((newFilters) => { setFilters(prev => ({ ...prev, ...newFilters })); setPage(1); }, []);
  const updateSort = useCallback((field, order) => { setSortBy(field); setSortOrder(order); }, []);
  const goToPage = useCallback((p) => setPage(p), []);
  const resetFilters = useCallback(() => { setFilters(defaultFilters); setSearch(''); setPage(1); }, []);

  return {
    data, pagination, stats, loading, error,
    search, filters, sortBy, sortOrder, page, filterOptions,
    updateSearch, updateFilters, updateSort, goToPage, resetFilters
  };
}
