import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import csvParser from 'csv-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, '../data/truestate_assignment_dataset.csv');
const DB_PATH = path.join(__dirname, '../data/sales.db');

// Delete existing db
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('Deleted existing database');
}

const db = new Database(DB_PATH);

// Create table
db.exec(`
  CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transactionId TEXT,
    date TEXT,
    dateTs INTEGER,
    customerId TEXT,
    customerName TEXT,
    phone TEXT,
    gender TEXT,
    age INTEGER,
    customerRegion TEXT,
    customerType TEXT,
    productId TEXT,
    productName TEXT,
    brand TEXT,
    productCategory TEXT,
    tags TEXT,
    quantity INTEGER,
    pricePerUnit REAL,
    discountPct REAL,
    totalAmount REAL,
    finalAmount REAL,
    paymentMethod TEXT,
    orderStatus TEXT,
    deliveryType TEXT,
    storeId TEXT,
    storeLocation TEXT,
    salespersonId TEXT,
    employeeName TEXT,
    searchStr TEXT
  )
`);

// Create indexes for faster queries
db.exec(`CREATE INDEX idx_search ON sales(searchStr)`);
db.exec(`CREATE INDEX idx_region ON sales(customerRegion)`);
db.exec(`CREATE INDEX idx_gender ON sales(gender)`);
db.exec(`CREATE INDEX idx_category ON sales(productCategory)`);
db.exec(`CREATE INDEX idx_payment ON sales(paymentMethod)`);
db.exec(`CREATE INDEX idx_date ON sales(dateTs)`);
db.exec(`CREATE INDEX idx_age ON sales(age)`);

const insert = db.prepare(`
  INSERT INTO sales (
    transactionId, date, dateTs, customerId, customerName, phone, gender, age,
    customerRegion, customerType, productId, productName, brand, productCategory,
    tags, quantity, pricePerUnit, discountPct, totalAmount, finalAmount,
    paymentMethod, orderStatus, deliveryType, storeId, storeLocation,
    salespersonId, employeeName, searchStr
  ) VALUES (
    @transactionId, @date, @dateTs, @customerId, @customerName, @phone, @gender, @age,
    @customerRegion, @customerType, @productId, @productName, @brand, @productCategory,
    @tags, @quantity, @pricePerUnit, @discountPct, @totalAmount, @finalAmount,
    @paymentMethod, @orderStatus, @deliveryType, @storeId, @storeLocation,
    @salespersonId, @employeeName, @searchStr
  )
`);

const insertMany = db.transaction((rows) => {
  for (const row of rows) insert.run(row);
});

console.log('Importing CSV to SQLite...');
const start = Date.now();

let rows = [];
let count = 0;
const BATCH_SIZE = 10000;

fs.createReadStream(CSV_PATH)
  .pipe(csvParser())
  .on('data', (row) => {
    const record = {
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
      tags: row['Tags'] || '',
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
    
    rows.push(record);
    count++;
    
    if (rows.length >= BATCH_SIZE) {
      insertMany(rows);
      rows = [];
      process.stdout.write(`\rImported ${count.toLocaleString()} records...`);
    }
  })
  .on('end', () => {
    if (rows.length > 0) {
      insertMany(rows);
    }
    
    const duration = Date.now() - start;
    console.log(`\n✓ Imported ${count.toLocaleString()} records in ${duration}ms`);
    
    // Get db file size
    const stats = fs.statSync(DB_PATH);
    console.log(`✓ Database size: ${(stats.size / 1024 / 1024).toFixed(1)}MB`);
    
    db.close();
  });

