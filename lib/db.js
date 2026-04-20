import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "salon.db");
const db = new Database(dbPath);
db.pragma("journal_mode = MEMORY");


db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    price REAL,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT,
    customer_name TEXT,
    user_id TEXT,
    service_name TEXT,
    appointment_date TEXT,
    appointment_time TEXT,
    status TEXT DEFAULT 'confirmed',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT,
    customer_name TEXT,
    content TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT,
    role TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS whatsapp_users (
    phone_number TEXT PRIMARY KEY,
    name TEXT,
    last_seen DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const userColumns = db.prepare("PRAGMA table_info(users)").all();
const hasPasswordColumn = userColumns.some((column) => column.name === "password");

if (!hasPasswordColumn) {
  db.exec("ALTER TABLE users ADD COLUMN password TEXT");
}

const servicesCount = db.prepare("SELECT COUNT(*) AS count FROM services").get();

if (servicesCount.count === 0) {
  const seedServices = db.prepare(`
    INSERT INTO services (name, description, duration_minutes, price, category)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((services) => {
    for (const service of services) {
      seedServices.run(
        service.name,
        service.description,
        service.duration_minutes,
        service.price,
        service.category
      );
    }
  });

  insertMany([
    {
      name: "Haircut",
      description: "Classic precision haircut tailored to your style.",
      duration_minutes: 45,
      price: 30,
      category: "Hair",
    },
    {
      name: "Hair Color",
      description: "Full-service professional coloring treatment.",
      duration_minutes: 120,
      price: 80,
      category: "Hair",
    },
    {
      name: "Blowout",
      description: "Shampoo and sleek blow-dry finishing service.",
      duration_minutes: 60,
      price: 45,
      category: "Hair",
    },
    {
      name: "Facial",
      description: "Deep cleansing and hydrating facial treatment.",
      duration_minutes: 75,
      price: 65,
      category: "Skincare",
    },
    {
      name: "Manicure",
      description: "Nail shaping, cuticle care, and polish application.",
      duration_minutes: 45,
      price: 25,
      category: "Nails",
    },
    {
      name: "Pedicure",
      description: "Foot soak, exfoliation, and polish service.",
      duration_minutes: 60,
      price: 35,
      category: "Nails",
    },
  ]);
}

export default db;
