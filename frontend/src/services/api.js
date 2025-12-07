const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function fetchTransactions(params = {}) {
  const query = new URLSearchParams();

  if (params.search) query.set('search', params.search);
  if (params.customerRegion?.length) query.set('customerRegion', params.customerRegion.join(','));
  if (params.gender?.length) query.set('gender', params.gender.join(','));
  if (params.productCategory?.length) query.set('productCategory', params.productCategory.join(','));
  if (params.tags?.length) query.set('tags', params.tags.join(','));
  if (params.paymentMethod?.length) query.set('paymentMethod', params.paymentMethod.join(','));
  if (params.ageMin) query.set('ageMin', params.ageMin);
  if (params.ageMax) query.set('ageMax', params.ageMax);
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);
  if (params.page) query.set('page', params.page);

  const res = await fetch(`${API}/sales?${query}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function fetchFilterOptions() {
  const res = await fetch(`${API}/sales/filters`);
  if (!res.ok) throw new Error('Failed to fetch filters');
  return res.json();
}
