import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csvParser from 'csv-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let salesData = [];
let filterOpts = {
  customerRegions: [],
  genders: [],
  productCategories: [],
  tags: [],
  paymentMethods: []
};

function parseRow(row) {
  const tags = row['Tags'] ? row['Tags'].split(',').map(t => t.trim()) : [];
  
  return {
    transactionId: row['Transaction ID'],
    date: row['Date'],
    dateTs: new Date(row['Date']).getTime(),
    customerId: row['Customer ID'],
    customerName: row['Customer Name'],
    phone: row['Phone Number'],
    gender: row['Gender'],
    age: parseInt(row['Age']) || 0,
    customerRegion: row['Customer Region'],
    customerType: row['Customer Type'],
    productId: row['Product ID'],
    productName: row['Product Name'],
    brand: row['Brand'],
    productCategory: row['Product Category'],
    tags,
    quantity: parseInt(row['Quantity']) || 0,
    pricePerUnit: parseFloat(row['Price per Unit']) || 0,
    discountPct: parseFloat(row['Discount Percentage']) || 0,
    totalAmount: parseFloat(row['Total Amount']) || 0,
    finalAmount: parseFloat(row['Final Amount']) || 0,
    paymentMethod: row['Payment Method'],
    orderStatus: row['Order Status'],
    deliveryType: row['Delivery Type'],
    storeId: row['Store ID'],
    storeLocation: row['Store Location'],
    salespersonId: row['Salesperson ID'],
    employeeName: row['Employee Name'],
    searchStr: `${row['Customer Name']} ${row['Phone Number']}`.toLowerCase()
  };
}

function addToFilterOpts(rec) {
  if (rec.customerRegion && !filterOpts.customerRegions.includes(rec.customerRegion)) {
    filterOpts.customerRegions.push(rec.customerRegion);
  }
  if (rec.gender && !filterOpts.genders.includes(rec.gender)) {
    filterOpts.genders.push(rec.gender);
  }
  if (rec.productCategory && !filterOpts.productCategories.includes(rec.productCategory)) {
    filterOpts.productCategories.push(rec.productCategory);
  }
  if (rec.paymentMethod && !filterOpts.paymentMethods.includes(rec.paymentMethod)) {
    filterOpts.paymentMethods.push(rec.paymentMethod);
  }
  rec.tags.forEach(tag => {
    if (tag && !filterOpts.tags.includes(tag)) filterOpts.tags.push(tag);
  });
}

export function loadCSV() {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const csvPath = path.join(__dirname, '../../data/truestate_assignment_dataset.csv');
    
    console.log('Loading CSV...');
    
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (row) => {
        const rec = parseRow(row);
        salesData.push(rec);
        addToFilterOpts(rec);
      })
      .on('end', () => {
        filterOpts.customerRegions.sort();
        filterOpts.genders.sort();
        filterOpts.productCategories.sort();
        filterOpts.tags.sort();
        filterOpts.paymentMethods.sort();
        
        console.log(`Loaded ${salesData.length} records in ${Date.now() - start}ms`);
        resolve();
      })
      .on('error', reject);
  });
}

export function getData() {
  return salesData;
}

export function getFilterOpts() {
  return filterOpts;
}
