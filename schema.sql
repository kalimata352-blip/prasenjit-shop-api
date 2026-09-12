CREATE TABLE IF NOT EXISTS volunteers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  father_name TEXT,
  dob TEXT,
  gender TEXT,
  mobile TEXT UNIQUE NOT NULL,
  full_address TEXT,
  district TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
