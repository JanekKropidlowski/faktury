import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: 'faktury-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database setup
const dbPath = path.join(dataDir, 'app.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Businesses table
  db.run(`
    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      seller_name TEXT NOT NULL,
      seller_address TEXT NOT NULL,
      seller_nip TEXT,
      seller_bank_account TEXT,
      monthly_limit DECIMAL(10,2) DEFAULT 8000.00,
      yearly_limit DECIMAL(10,2) DEFAULT 20000.00,
      is_active BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Invoices table
  db.run(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      invoice_number TEXT NOT NULL,
      issue_date DATE NOT NULL,
      buyer_name TEXT NOT NULL,
      buyer_address TEXT NOT NULL,
      buyer_nip TEXT,
      notes TEXT,
      total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses (id)
    )
  `);

  // Invoice items table
  db.run(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
      unit_price DECIMAL(10,2) NOT NULL,
      tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
      total_price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
    )
  `);

  // Insert default user if not exists
  db.get("SELECT id FROM users WHERE email = 'admin@faktury.pl'", (err, row) => {
    if (!row) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run(
        "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
        ['admin@faktury.pl', hashedPassword, 'Administrator']
      );
    }
  });
});

// Middleware to check authentication
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Wymagane zalogowanie' });
  }
  next();
};

// AUTH ROUTES
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, user: any) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
      }
      
      req.session.userId = user.id;
      res.json({ message: 'Zalogowano pomyślnie', user: { id: user.id, email: user.email, name: user.name } });
    }
  );
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Wylogowano pomyślnie' });
  });
});

app.get('/api/me', requireAuth, (req, res) => {
  db.get(
    "SELECT id, email, name FROM users WHERE id = ?",
    [req.session.userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      res.json(user);
    }
  );
});

// BUSINESSES ROUTES
app.get('/api/businesses', requireAuth, (req, res) => {
  db.all(
    "SELECT * FROM businesses WHERE user_id = ? ORDER BY created_at DESC",
    [req.session.userId],
    (err, businesses) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      res.json(businesses);
    }
  );
});

app.post('/api/businesses', requireAuth, (req, res) => {
  const { name, seller_name, seller_address, seller_nip, seller_bank_account, monthly_limit, yearly_limit } = req.body;
  
  db.run(
    `INSERT INTO businesses (user_id, name, seller_name, seller_address, seller_nip, seller_bank_account, monthly_limit, yearly_limit) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.session.userId, name, seller_name, seller_address, seller_nip, seller_bank_account, monthly_limit, yearly_limit],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      res.json({ id: this.lastID, message: 'Działalność utworzona pomyślnie' });
    }
  );
});

app.put('/api/businesses/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, seller_name, seller_address, seller_nip, seller_bank_account, monthly_limit, yearly_limit } = req.body;
  
  db.run(
    `UPDATE businesses SET name = ?, seller_name = ?, seller_address = ?, seller_nip = ?, 
     seller_bank_account = ?, monthly_limit = ?, yearly_limit = ? 
     WHERE id = ? AND user_id = ?`,
    [name, seller_name, seller_address, seller_nip, seller_bank_account, monthly_limit, yearly_limit, id, req.session.userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      res.json({ message: 'Działalność zaktualizowana pomyślnie' });
    }
  );
});

app.put('/api/businesses/:id/activate', requireAuth, (req, res) => {
  const { id } = req.params;
  
  db.serialize(() => {
    // Deactivate all businesses for user
    db.run(
      "UPDATE businesses SET is_active = FALSE WHERE user_id = ?",
      [req.session.userId]
    );
    
    // Activate selected business
    db.run(
      "UPDATE businesses SET is_active = TRUE WHERE id = ? AND user_id = ?",
      [id, req.session.userId],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Błąd serwera' });
        }
        res.json({ message: 'Działalność aktywowana pomyślnie' });
      }
    );
  });
});

app.delete('/api/businesses/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  
  db.run(
    "DELETE FROM businesses WHERE id = ? AND user_id = ?",
    [id, req.session.userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      res.json({ message: 'Działalność usunięta pomyślnie' });
    }
  );
});

// DASHBOARD ROUTES
app.get('/api/dashboard', requireAuth, (req, res) => {
  db.get(
    "SELECT * FROM businesses WHERE user_id = ? AND is_active = TRUE",
    [req.session.userId],
    (err, business: any) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      
      if (!business) {
        return res.json({ hasActiveBusiness: false });
      }
      
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      // Get monthly revenue
      db.get(
        `SELECT COALESCE(SUM(total_amount), 0) as monthly_revenue 
         FROM invoices 
         WHERE business_id = ? AND strftime('%Y', issue_date) = ? AND strftime('%m', issue_date) = ?`,
        [business.id, currentYear.toString(), currentMonth.toString().padStart(2, '0')],
        (err, monthlyData: any) => {
          if (err) {
            return res.status(500).json({ error: 'Błąd serwera' });
          }
          
          // Get yearly revenue
          db.get(
            `SELECT COALESCE(SUM(total_amount), 0) as yearly_revenue 
             FROM invoices 
             WHERE business_id = ? AND strftime('%Y', issue_date) = ?`,
            [business.id, currentYear.toString()],
            (err, yearlyData: any) => {
              if (err) {
                return res.status(500).json({ error: 'Błąd serwera' });
              }
              
              // Get recent invoices
              db.all(
                `SELECT id, invoice_number, issue_date, buyer_name, total_amount 
                 FROM invoices 
                 WHERE business_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT 5`,
                [business.id],
                (err, recentInvoices) => {
                  if (err) {
                    return res.status(500).json({ error: 'Błąd serwera' });
                  }
                  
                  res.json({
                    hasActiveBusiness: true,
                    business,
                    monthlyRevenue: monthlyData.monthly_revenue,
                    yearlyRevenue: yearlyData.yearly_revenue,
                    monthlyLimitRemaining: business.monthly_limit - monthlyData.monthly_revenue,
                    yearlyLimitRemaining: business.yearly_limit - yearlyData.yearly_revenue,
                    recentInvoices
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// INVOICES ROUTES
app.get('/api/invoices', requireAuth, (req, res) => {
  const { search, month, year } = req.query;
  
  db.get(
    "SELECT id FROM businesses WHERE user_id = ? AND is_active = TRUE",
    [req.session.userId],
    (err, business: any) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      
      if (!business) {
        return res.json([]);
      }
      
      let query = `SELECT * FROM invoices WHERE business_id = ?`;
      let params: any[] = [business.id];
      
      if (search) {
        query += ` AND (invoice_number LIKE ? OR buyer_name LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }
      
      if (month && year) {
        query += ` AND strftime('%Y-%m', issue_date) = ?`;
        params.push(`${year}-${month.toString().padStart(2, '0')}`);
      } else if (year) {
        query += ` AND strftime('%Y', issue_date) = ?`;
        params.push(year.toString());
      }
      
      query += ` ORDER BY issue_date DESC, created_at DESC`;
      
      db.all(query, params, (err, invoices) => {
        if (err) {
          return res.status(500).json({ error: 'Błąd serwera' });
        }
        res.json(invoices);
      });
    }
  );
});

app.get('/api/invoices/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  
  db.get(
    `SELECT i.*, b.* 
     FROM invoices i 
     JOIN businesses b ON i.business_id = b.id 
     WHERE i.id = ? AND b.user_id = ?`,
    [id, req.session.userId],
    (err, invoice: any) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      
      if (!invoice) {
        return res.status(404).json({ error: 'Faktura nie znaleziona' });
      }
      
      // Get invoice items
      db.all(
        "SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id",
        [id],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: 'Błąd serwera' });
          }
          
          res.json({ ...invoice, items });
        }
      );
    }
  );
});

app.post('/api/invoices', requireAuth, (req, res) => {
  const { issue_date, buyer_name, buyer_address, buyer_nip, notes, items } = req.body;
  
  db.get(
    "SELECT id FROM businesses WHERE user_id = ? AND is_active = TRUE",
    [req.session.userId],
    (err, business: any) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      
      if (!business) {
        return res.status(400).json({ error: 'Brak aktywnej działalności' });
      }
      
      // Generate invoice number
      const date = new Date(issue_date);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      
      db.get(
        `SELECT COUNT(*) as count FROM invoices 
         WHERE business_id = ? AND strftime('%Y-%m', issue_date) = ?`,
        [business.id, `${year}-${month}`],
        (err, result: any) => {
          if (err) {
            return res.status(500).json({ error: 'Błąd serwera' });
          }
          
          const invoiceNumber = `INV/${year}/${month}/${(result.count + 1).toString().padStart(3, '0')}`;
          
          // Calculate total amount
          const totalAmount = items.reduce((sum: number, item: any) => {
            const itemTotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
            const taxAmount = itemTotal * (parseFloat(item.tax_rate) / 100);
            return sum + itemTotal + taxAmount;
          }, 0);
          
          db.run(
            `INSERT INTO invoices (business_id, invoice_number, issue_date, buyer_name, buyer_address, buyer_nip, notes, total_amount) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [business.id, invoiceNumber, issue_date, buyer_name, buyer_address, buyer_nip, notes, totalAmount],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Błąd serwera' });
              }
              
              const invoiceId = this.lastID;
              
              // Insert invoice items
              const stmt = db.prepare(
                "INSERT INTO invoice_items (invoice_id, name, quantity, unit_price, tax_rate, total_price) VALUES (?, ?, ?, ?, ?, ?)"
              );
              
              items.forEach((item: any) => {
                const itemTotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
                const taxAmount = itemTotal * (parseFloat(item.tax_rate) / 100);
                const totalPrice = itemTotal + taxAmount;
                
                stmt.run([invoiceId, item.name, item.quantity, item.unit_price, item.tax_rate, totalPrice]);
              });
              
              stmt.finalize();
              
              res.json({ id: invoiceId, invoice_number: invoiceNumber, message: 'Faktura utworzona pomyślnie' });
            }
          );
        }
      );
    }
  );
});

app.put('/api/invoices/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { issue_date, buyer_name, buyer_address, buyer_nip, notes, items } = req.body;
  
  // Verify ownership
  db.get(
    `SELECT i.id FROM invoices i 
     JOIN businesses b ON i.business_id = b.id 
     WHERE i.id = ? AND b.user_id = ?`,
    [id, req.session.userId],
    (err, invoice) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      
      if (!invoice) {
        return res.status(404).json({ error: 'Faktura nie znaleziona' });
      }
      
      // Calculate total amount
      const totalAmount = items.reduce((sum: number, item: any) => {
        const itemTotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
        const taxAmount = itemTotal * (parseFloat(item.tax_rate) / 100);
        return sum + itemTotal + taxAmount;
      }, 0);
      
      db.serialize(() => {
        // Update invoice
        db.run(
          `UPDATE invoices SET issue_date = ?, buyer_name = ?, buyer_address = ?, buyer_nip = ?, notes = ?, total_amount = ? 
           WHERE id = ?`,
          [issue_date, buyer_name, buyer_address, buyer_nip, notes, totalAmount, id]
        );
        
        // Delete old items
        db.run("DELETE FROM invoice_items WHERE invoice_id = ?", [id]);
        
        // Insert new items
        const stmt = db.prepare(
          "INSERT INTO invoice_items (invoice_id, name, quantity, unit_price, tax_rate, total_price) VALUES (?, ?, ?, ?, ?, ?)"
        );
        
        items.forEach((item: any) => {
          const itemTotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
          const taxAmount = itemTotal * (parseFloat(item.tax_rate) / 100);
          const totalPrice = itemTotal + taxAmount;
          
          stmt.run([id, item.name, item.quantity, item.unit_price, item.tax_rate, totalPrice]);
        });
        
        stmt.finalize(() => {
          res.json({ message: 'Faktura zaktualizowana pomyślnie' });
        });
      });
    }
  );
});

app.delete('/api/invoices/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  
  db.get(
    `SELECT i.id FROM invoices i 
     JOIN businesses b ON i.business_id = b.id 
     WHERE i.id = ? AND b.user_id = ?`,
    [id, req.session.userId],
    (err, invoice) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd serwera' });
      }
      
      if (!invoice) {
        return res.status(404).json({ error: 'Faktura nie znaleziona' });
      }
      
      db.run("DELETE FROM invoices WHERE id = ?", [id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Błąd serwera' });
        }
        res.json({ message: 'Faktura usunięta pomyślnie' });
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});