import { getDB, getFilterOptions as getOpts } from '../utils/database.js';

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

  const db = getDB();
  const conditions = [];
  const sqlParams = {};

  // Search
  if (search && search.trim()) {
    conditions.push("searchStr LIKE @search");
    sqlParams.search = `%${search.toLowerCase().trim()}%`;
  }

  // Multi-select filters
  if (customerRegion.length > 0) {
    conditions.push(`customerRegion IN (${customerRegion.map((_, i) => `@region${i}`).join(', ')})`);
    customerRegion.forEach((v, i) => sqlParams[`region${i}`] = v);
  }
  if (gender.length > 0) {
    conditions.push(`gender IN (${gender.map((_, i) => `@gender${i}`).join(', ')})`);
    gender.forEach((v, i) => sqlParams[`gender${i}`] = v);
  }
  if (productCategory.length > 0) {
    conditions.push(`productCategory IN (${productCategory.map((_, i) => `@cat${i}`).join(', ')})`);
    productCategory.forEach((v, i) => sqlParams[`cat${i}`] = v);
  }
  if (paymentMethod.length > 0) {
    conditions.push(`paymentMethod IN (${paymentMethod.map((_, i) => `@pay${i}`).join(', ')})`);
    paymentMethod.forEach((v, i) => sqlParams[`pay${i}`] = v);
  }
  if (tags.length > 0) {
    const tagConditions = tags.map((_, i) => `tags LIKE @tag${i}`);
    conditions.push(`(${tagConditions.join(' OR ')})`);
    tags.forEach((v, i) => sqlParams[`tag${i}`] = `%${v}%`);
  }

  // Range filters
  if (ageMin !== undefined && !isNaN(ageMin)) {
    conditions.push("age >= @ageMin");
    sqlParams.ageMin = ageMin;
  }
  if (ageMax !== undefined && !isNaN(ageMax)) {
    conditions.push("age <= @ageMax");
    sqlParams.ageMax = ageMax;
  }
  if (dateFrom) {
    const fromTs = new Date(dateFrom).getTime();
    if (!isNaN(fromTs)) {
      conditions.push("dateTs >= @dateFrom");
      sqlParams.dateFrom = fromTs;
    }
  }
  if (dateTo) {
    const toTs = new Date(dateTo).getTime();
    if (!isNaN(toTs)) {
      conditions.push("dateTs <= @dateTo");
      sqlParams.dateTo = toTs;
    }
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Sort
  const validSorts = { date: 'dateTs', quantity: 'quantity', customerName: 'customerName' };
  const sortCol = validSorts[sortBy] || 'dateTs';
  const sortDir = sortOrder === 'asc' ? 'ASC' : 'DESC';

  // Get total count and stats
  const countSql = `SELECT COUNT(*) as total, SUM(quantity) as units, SUM(totalAmount) as amount, SUM(totalAmount - finalAmount) as discount FROM sales ${whereClause}`;
  const statsResult = db.prepare(countSql).get(sqlParams);
  
  const total = statsResult.total;
  const stats = {
    totalUnits: statsResult.units || 0,
    totalAmount: statsResult.amount || 0,
    totalDiscount: statsResult.discount || 0
  };

  // Pagination
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const currentPage = Math.min(Math.max(1, parseInt(page) || 1), totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Get data
  const dataSql = `
    SELECT transactionId, date, customerId, customerName, phone, gender, age,
           customerRegion, productId, productName, brand, productCategory, tags,
           quantity, totalAmount, finalAmount, paymentMethod, orderStatus, employeeName
    FROM sales ${whereClause}
    ORDER BY ${sortCol} ${sortDir}
    LIMIT @limit OFFSET @offset
  `;
  
  const data = db.prepare(dataSql).all({ ...sqlParams, limit: PAGE_SIZE, offset });

  // Parse tags back to array
  data.forEach(row => {
    row.tags = row.tags ? row.tags.split(',').map(t => t.trim()) : [];
  });

  return {
    data,
    pagination: { total, page: currentPage, totalPages, pageSize: PAGE_SIZE },
    stats
  };
}

export function getFilterOptions() {
  return getOpts();
}
