import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csvParser from 'csv-parser';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, '../../data/truestate_assignment_dataset.csv');

// Google Drive direct download URL
const DRIVE_FILE_ID = process.env.DRIVE_FILE_ID || '1tzbyuxBmrBwMSXbL22r33FUMtO0V_lxb';
const DOWNLOAD_URL = `https://drive.google.com/uc?export=download&confirm=yes&id=${DRIVE_FILE_ID}`;

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

function downloadCSV() {
  return new Promise((resolve, reject) => {
    console.log('CSV not found locally. Downloading from Google Drive...');
    
    const dataDir = path.dirname(CSV_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const file = fs.createWriteStream(CSV_PATH);
    
    https.get(DOWNLOAD_URL, (response) => {
      // Handle redirect
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log('Download complete!');
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('Download complete!');
          resolve();
        });
      }
    }).on('error', (err) => {
      fs.unlink(CSV_PATH, () => {});
      reject(err);
    });
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
  // Check if CSV exists, download if not
  if (!fs.existsSync(CSV_PATH)) {
    try {
      await downloadCSV();
    } catch (err) {
      console.error('Failed to download CSV:', err.message);
      console.log('Please download the CSV manually and place it in backend/data/');
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
