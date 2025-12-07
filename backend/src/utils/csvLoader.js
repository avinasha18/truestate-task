import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import csvParser from 'csv-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, '../../data/truestate_assignment_dataset.csv');

// Direct download URL (Dropbox with dl=1 for direct download)
const CSV_URL = process.env.CSV_URL || 'https://www.dropbox.com/scl/fi/le1ff86kz1ks9tc2x6jhs/truestate_assignment_dataset.csv?rlkey=co19h65iqvkx0062nc5vnqlwq&st=jvqm04ch&dl=1';

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
    customerName: row['Customer Name'] || '',
    phone: row['Phone Number'] || '',
    gender: row['Gender'] || '',
    age: parseInt(row['Age']) || 0,
    customerRegion: row['Customer Region'] || '',
    customerType: row['Customer Type'] || '',
    productId: row['Product ID'] || '',
    productName: row['Product Name'] || '',
    brand: row['Brand'] || '',
    productCategory: row['Product Category'] || '',
    tags,
    quantity: parseInt(row['Quantity']) || 0,
    pricePerUnit: parseFloat(row['Price per Unit']) || 0,
    discountPct: parseFloat(row['Discount Percentage']) || 0,
    totalAmount: parseFloat(row['Total Amount']) || 0,
    finalAmount: parseFloat(row['Final Amount']) || 0,
    paymentMethod: row['Payment Method'] || '',
    orderStatus: row['Order Status'] || '',
    deliveryType: row['Delivery Type'] || '',
    storeId: row['Store ID'] || '',
    storeLocation: row['Store Location'] || '',
    salespersonId: row['Salesperson ID'] || '',
    employeeName: row['Employee Name'] || '',
    searchStr: `${row['Customer Name'] || ''} ${row['Phone Number'] || ''}`.toLowerCase()
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

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const dataDir = path.dirname(dest);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const file = fs.createWriteStream(dest);
    
    const request = (url) => {
      https.get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          request(res.headers.location);
          return;
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    };
    
    request(url);
  });
}

function processCSV() {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    console.log('Processing CSV file...');
    
    fs.createReadStream(CSV_PATH)
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
        
        const duration = Date.now() - start;
        console.log(`✓ Loaded ${salesData.length.toLocaleString()} records in ${duration}ms`);
        console.log(`✓ Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        resolve();
      })
      .on('error', reject);
  });
}

export async function loadCSV() {
  if (!fs.existsSync(CSV_PATH)) {
    if (CSV_URL) {
      console.log('CSV not found. Downloading...');
      try {
        await downloadFile(CSV_URL, CSV_PATH);
        console.log('Download complete!');
      } catch (err) {
        console.error('Download failed:', err.message);
        throw new Error('CSV download failed. Please set CSV_URL environment variable to a direct download link.');
      }
    } else {
      console.error('CSV file not found at:', CSV_PATH);
      console.error('Please either:');
      console.error('1. Place the CSV file in backend/data/');
      console.error('2. Set CSV_URL environment variable to a direct download link');
      throw new Error('CSV file not available');
    }
  }
  
  await processCSV();
}

export function getData() {
  return salesData;
}

export function getFilterOpts() {
  return filterOpts;
}
