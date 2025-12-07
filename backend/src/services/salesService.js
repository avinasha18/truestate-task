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

  // search
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(r => r.searchStr.includes(q));
  }

  // filters
  if (customerRegion.length) results = results.filter(r => customerRegion.includes(r.customerRegion));
  if (gender.length) results = results.filter(r => gender.includes(r.gender));
  if (ageMin !== undefined) results = results.filter(r => r.age >= ageMin);
  if (ageMax !== undefined) results = results.filter(r => r.age <= ageMax);
  if (productCategory.length) results = results.filter(r => productCategory.includes(r.productCategory));
  if (tags.length) results = results.filter(r => r.tags.some(t => tags.includes(t)));
  if (paymentMethod.length) results = results.filter(r => paymentMethod.includes(r.paymentMethod));
  if (dateFrom) {
    const fromTs = new Date(dateFrom).getTime();
    results = results.filter(r => r.dateTs >= fromTs);
  }
  if (dateTo) {
    const toTs = new Date(dateTo).getTime();
    results = results.filter(r => r.dateTs <= toTs);
  }

  // stats before pagination
  const stats = {
    totalUnits: results.reduce((sum, r) => sum + r.quantity, 0),
    totalAmount: results.reduce((sum, r) => sum + r.totalAmount, 0),
    totalDiscount: results.reduce((sum, r) => sum + (r.totalAmount - r.finalAmount), 0)
  };

  // sort
  const sorted = [...results];
  const mult = sortOrder === 'asc' ? 1 : -1;
  sorted.sort((a, b) => {
    if (sortBy === 'date') return (a.dateTs - b.dateTs) * mult;
    if (sortBy === 'quantity') return (a.quantity - b.quantity) * mult;
    if (sortBy === 'customerName') return a.customerName.localeCompare(b.customerName) * mult;
    return 0;
  });

  // paginate
  const total = sorted.length;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
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
