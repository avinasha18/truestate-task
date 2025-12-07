import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../data/sales.db');

// Dropbox direct download URL
const DB_URL = process.env.DB_URL || 'https://www.dropbox.com/scl/fi/4pfzkow4u3s9mt9vakz6o/sales.db?rlkey=9earui04vksw5mcfbzmy7xsy8&st=g2onb796&dl=1';

let db = null;

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log('Downloading database...');
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
        const total = parseInt(res.headers['content-length'], 10);
        let downloaded = 0;
        
        res.on('data', (chunk) => {
          downloaded += chunk.length;
          if (total) {
            const pct = ((downloaded / total) * 100).toFixed(1);
            process.stdout.write(`\rDownloading: ${pct}%`);
          }
        });
        
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('\n✓ Download complete');
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

export async function initDB() {
  if (!fs.existsSync(DB_PATH)) {
    if (DB_URL) {
      await downloadFile(DB_URL, DB_PATH);
    } else {
      console.error('Database not found. Please either:');
      console.error('1. Run "npm run import" locally with CSV file');
      console.error('2. Set DB_URL environment variable');
      throw new Error('Database not available');
    }
  }
  
  db = new Database(DB_PATH, { readonly: true });
  const count = db.prepare('SELECT COUNT(*) as count FROM sales').get();
  console.log(`✓ Database loaded: ${count.count.toLocaleString()} records`);
  return db;
}

export function getDB() {
  return db;
}

export function getFilterOptions() {
  const regions = db.prepare("SELECT DISTINCT customerRegion FROM sales WHERE customerRegion IS NOT NULL AND customerRegion != '' ORDER BY customerRegion").all();
  const genders = db.prepare("SELECT DISTINCT gender FROM sales WHERE gender IS NOT NULL AND gender != '' ORDER BY gender").all();
  const categories = db.prepare("SELECT DISTINCT productCategory FROM sales WHERE productCategory IS NOT NULL AND productCategory != '' ORDER BY productCategory").all();
  const payments = db.prepare("SELECT DISTINCT paymentMethod FROM sales WHERE paymentMethod IS NOT NULL AND paymentMethod != '' ORDER BY paymentMethod").all();
  const tagsRaw = db.prepare("SELECT DISTINCT tags FROM sales WHERE tags IS NOT NULL AND tags != ''").all();
  
  const tagSet = new Set();
  tagsRaw.forEach(row => {
    row.tags.split(',').forEach(t => {
      const tag = t.trim();
      if (tag) tagSet.add(tag);
    });
  });
  
  return {
    customerRegions: regions.map(r => r.customerRegion),
    genders: genders.map(r => r.gender),
    productCategories: categories.map(r => r.productCategory),
    paymentMethods: payments.map(r => r.paymentMethod),
    tags: Array.from(tagSet).sort()
  };
}
