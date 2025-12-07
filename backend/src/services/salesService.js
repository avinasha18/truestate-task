import { getData, getFilterOpts } from '../utils/csvLoader.js';

const PAGE_SIZE = 10;

export function queryTransactions(params) {
  const {
    search = '',
    customerRegion = [],
    gender = [],
    ageMin,
    ageMax,
    productCategory = [],
    tags = [],
    paymentMethod = [],
    dateFrom,
    dateTo,
    sortBy = 'date',
    sortOrder = 'desc',
    page = 1
  } = params;

  let results = getData();

  // Search - case insensitive partial match
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    results = results.filter(r => r.searchStr.includes(q));
  }

  // Multi-select filters
  if (customerRegion.length > 0) {
    results = results.filter(r => customerRegion.includes(r.customerRegion));
  }
  if (gender.length > 0) {
    results = results.filter(r => gender.includes(r.gender));
  }
  if (productCategory.length > 0) {
    results = results.filter(r => productCategory.includes(r.productCategory));
  }
  if (tags.length > 0) {
    results = results.filter(r => r.tags.some(t => tags.includes(t)));
  }
  if (paymentMethod.length > 0) {
    results = results.filter(r => paymentMethod.includes(r.paymentMethod));
  }

  // Range filters - validate min <= max
  if (ageMin !== undefined && !isNaN(ageMin)) {
    results = results.filter(r => r.age >= ageMin);
  }
  if (ageMax !== undefined && !isNaN(ageMax)) {
    results = results.filter(r => r.age <= ageMax);
  }
  if (dateFrom) {
    const fromTs = new Date(dateFrom).getTime();
    if (!isNaN(fromTs)) {
      results = results.filter(r => r.dateTs >= fromTs);
    }
  }
  if (dateTo) {
    const toTs = new Date(dateTo).getTime();
    if (!isNaN(toTs)) {
      results = results.filter(r => r.dateTs <= toTs);
    }
  }

  // Stats before pagination
  const stats = {
    totalUnits: results.reduce((sum, r) => sum + r.quantity, 0),
    totalAmount: results.reduce((sum, r) => sum + r.totalAmount, 0),
    totalDiscount: results.reduce((sum, r) => sum + (r.totalAmount - r.finalAmount), 0)
  };

  // Sort
  const validSortFields = ['date', 'quantity', 'customerName'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'date';
  const sortDir = sortOrder === 'asc' ? 1 : -1;
  
  const sorted = [...results];
  sorted.sort((a, b) => {
    if (sortField === 'date') return (a.dateTs - b.dateTs) * sortDir;
    if (sortField === 'quantity') return (a.quantity - b.quantity) * sortDir;
    if (sortField === 'customerName') return a.customerName.localeCompare(b.customerName) * sortDir;
    return 0;
  });

  // Paginate
  const total = sorted.length;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const currentPage = Math.min(Math.max(1, parseInt(page) || 1), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const data = sorted.slice(start, start + PAGE_SIZE);

  return {
    data,
    pagination: { total, page: currentPage, totalPages, pageSize: PAGE_SIZE },
    stats
  };
}

export function getFilterOptions() {
  return getFilterOpts();
}
