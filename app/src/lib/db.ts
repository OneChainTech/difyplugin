import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database | null = null;

export async function getDb() {
  if (db) {
    return db;
  }

  db = await open({
    filename: './fishing_app.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS fishing_spots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      fish_type TEXT,
      bait TEXT,
      environment TEXT,
      rod TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_online BOOLEAN DEFAULT 1
    )
  `);

  // Create exchange_requests table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS exchange_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users (id),
      FOREIGN KEY (to_user_id) REFERENCES users (id)
    )
  `);

  return db;
}

// Function to add a new fishing spot
export async function addSpot(userId: string, latitude: number, longitude: number, fish_type: string, bait: string, environment: string, rod: string) {
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO fishing_spots (user_id, latitude, longitude, fish_type, bait, environment, rod) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, latitude, longitude, fish_type, bait, environment, rod]
  );
  return result.lastID;
}

// Function to get fishing spots for a specific user
export async function getSpotsByUser(userId: string) {
  const db = await getDb();
  return db.all('SELECT * FROM fishing_spots WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

// Function to update user location
export async function updateUserLocation(userId: string, name: string, latitude: number, longitude: number) {
  const db = await getDb();
  await db.run(
    'INSERT OR REPLACE INTO users (id, name, latitude, longitude, last_seen, is_online) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 1)',
    [userId, name, latitude, longitude]
  );
}

// Function to get nearby users (within 50 meters)
export async function getNearbyUsers(userId: string, latitude: number, longitude: number, maxDistance: number = 50) {
  const db = await getDb();
  const users = await db.all(
    'SELECT * FROM users WHERE id != ? AND is_online = 1',
    [userId]
  );

  // Haversine公式
  function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => v * Math.PI / 180;
    const R = 6371000; // 地球半径（米）
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Filter users within maxDistance meters
  return users.filter(user => {
    const distance = haversine(latitude, longitude, user.latitude, user.longitude);
    return distance <= maxDistance;
  });
}

// Function to send exchange request
export async function sendExchangeRequest(fromUserId: string, toUserId: string, message: string) {
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO exchange_requests (from_user_id, to_user_id, message) VALUES (?, ?, ?)',
    [fromUserId, toUserId, message]
  );
  return result.lastID;
}

// Function to get exchange requests for a user
export async function getExchangeRequests(userId: string) {
  const db = await getDb();
  return db.all(
    'SELECT er.*, u1.name as from_user_name, u2.name as to_user_name FROM exchange_requests er ' +
    'JOIN users u1 ON er.from_user_id = u1.id ' +
    'JOIN users u2 ON er.to_user_id = u2.id ' +
    'WHERE er.to_user_id = ? ORDER BY er.created_at DESC',
    [userId]
  );
}

// 切换用户共享状态
export async function setUserSharing(userId: string, isSharing: boolean) {
  const db = await getDb();
  await db.run('UPDATE users SET is_sharing = ? WHERE id = ?', [isSharing ? 1 : 0, userId]);
}
