import { queryTransactions, getFilterOptions } from '../services/salesService.js';

function parseList(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

export function getTransactions(req, res) {
  try {
    const q = req.query;
    const params = {
      search: q.search || '',
      customerRegion: parseList(q.customerRegion),
      gender: parseList(q.gender),
      ageMin: q.ageMin ? parseInt(q.ageMin) : undefined,
      ageMax: q.ageMax ? parseInt(q.ageMax) : undefined,
      productCategory: parseList(q.productCategory),
      tags: parseList(q.tags),
      paymentMethod: parseList(q.paymentMethod),
      dateFrom: q.dateFrom || undefined,
      dateTo: q.dateTo || undefined,
      sortBy: q.sortBy || 'date',
      sortOrder: q.sortOrder || 'desc',
      page: q.page ? parseInt(q.page) : 1
    };
    res.json(queryTransactions(params));
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export function getFilters(req, res) {
  try {
    res.json(getFilterOptions());
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
