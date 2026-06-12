const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../../coaching.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

const hasColumn = (tableName, columnName) => {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return columns.some((column) => column.name === columnName);
};

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user' NOT NULL,
    password_set BOOLEAN DEFAULT FALSE NOT NULL,
    age INTEGER,
    weight REAL,
    goal TEXT,
    level TEXT,
    phone TEXT,
    offer_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    goal TEXT NOT NULL,
    level TEXT NOT NULL,
    duration_weeks INTEGER NOT NULL,
    description TEXT,
    session_minutes INTEGER DEFAULT 20,
    banner_image TEXT,
    coach_notes TEXT,
    location TEXT DEFAULT 'Domicile'
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    week INTEGER NOT NULL,
    day INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (program_id) REFERENCES programs(id)
  );

  CREATE TABLE IF NOT EXISTS program_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    scheduled_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS daily_checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    checkin_date TEXT NOT NULL,
    mood INTEGER NOT NULL,
    energy INTEGER NOT NULL,
    sleep_quality INTEGER NOT NULL,
    stress INTEGER DEFAULT 3,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, checkin_date)
  );

  CREATE TABLE IF NOT EXISTS assignment_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    difficulty INTEGER NOT NULL,
    fatigue INTEGER NOT NULL,
    pain INTEGER NOT NULL,
    comments TEXT,
    duration_minutes INTEGER DEFAULT 0,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES program_assignments(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(assignment_id, user_id)
  );
`);

if (!hasColumn('programs', 'session_minutes')) {
  db.exec(`ALTER TABLE programs ADD COLUMN session_minutes INTEGER DEFAULT 20`);
}

if (!hasColumn('programs', 'banner_image')) {
  db.exec(`ALTER TABLE programs ADD COLUMN banner_image TEXT`);
}

if (!hasColumn('programs', 'coach_notes')) {
  db.exec(`ALTER TABLE programs ADD COLUMN coach_notes TEXT`);
}

if (!hasColumn('programs', 'location')) {
  db.exec(`ALTER TABLE programs ADD COLUMN location TEXT DEFAULT 'Domicile'`);
}

if (!hasColumn('users', 'first_name')) {
  db.exec(`ALTER TABLE users ADD COLUMN first_name TEXT`);
}

if (!hasColumn('users', 'last_name')) {
  db.exec(`ALTER TABLE users ADD COLUMN last_name TEXT`);
}

if (!hasColumn('users', 'birth_date')) {
  db.exec(`ALTER TABLE users ADD COLUMN birth_date TEXT`);
}

if (!hasColumn('users', 'phone')) {
  db.exec(`ALTER TABLE users ADD COLUMN phone TEXT`);
}

if (!hasColumn('users', 'offer_type')) {
  db.exec(`ALTER TABLE users ADD COLUMN offer_type TEXT`);
}

if (!hasColumn('daily_checkins', 'stress')) {
  db.exec(`ALTER TABLE daily_checkins ADD COLUMN stress INTEGER DEFAULT 3`);
}

db.exec(`
  DROP TABLE IF EXISTS exercises;
  DROP TABLE IF EXISTS user_progress;
`);

// Seed data if tables are empty
const programCount = db.prepare('SELECT COUNT(*) as count FROM programs').get().count;
if (programCount === 0) {
  // Program 1: Débutant Force
  const insertProgram1 = db.prepare(`
    INSERT INTO programs (name, goal, level, duration_weeks, description, session_minutes, coach_notes, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const program1Id = insertProgram1.run(
    'Débutant Force',
    'Prendre de la masse',
    'débutant',
    4,
    'Programme de musculation pour débutants visant à développer la force de base.',
    45,
    'Conserver 90 secondes de récupération entre les blocs.',
    'Salle'
  ).lastInsertRowid;

  // Workouts for Program 1
  const workouts1 = [
    { week: 1, day: 1, name: 'Push', description: 'Entraînement push pour le haut du corps' },
    { week: 1, day: 2, name: 'Pull', description: 'Entraînement pull pour le dos' },
    { week: 2, day: 1, name: 'Push Avancé', description: 'Push avec plus d\'intensité' },
    { week: 2, day: 2, name: 'Pull Avancé', description: 'Pull avec plus d\'intensité' },
  ];

  const insertWorkout = db.prepare(`
    INSERT INTO workouts (program_id, week, day, name, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  workouts1.forEach(workout => {
    insertWorkout.run(program1Id, workout.week, workout.day, workout.name, workout.description);
  });

  // Program 2: Cardio Débutant
  const insertProgram2 = db.prepare(`
    INSERT INTO programs (name, goal, level, duration_weeks, description, session_minutes, coach_notes, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const program2Id = insertProgram2.run(
    'Cardio Débutant',
    'Perdre du poids',
    'débutant',
    4,
    'Programme cardio pour débutants axé sur la perte de poids.',
    30,
    'Commencer en aisance respiratoire avant de monter en intensité.',
    'Domicile'
  ).lastInsertRowid;

  // Workouts for Program 2
  const workouts2 = [
    { week: 1, day: 1, name: 'Course Léger', description: 'Course légère pour commencer' },
    { week: 1, day: 2, name: 'Marche Rapide', description: 'Marche rapide avec intervalles' },
    { week: 2, day: 1, name: 'Course Moyenne', description: 'Course avec plus d\'intensité' },
    { week: 2, day: 2, name: 'HIIT Débutant', description: 'Entraînement par intervalles' },
  ];

  workouts2.forEach(workout => {
    insertWorkout.run(program2Id, workout.week, workout.day, workout.name, workout.description);
  });
}

db.exec(`
  UPDATE programs
  SET
    session_minutes = COALESCE(session_minutes, 20),
    location = COALESCE(location, 'Domicile'),
    coach_notes = COALESCE(coach_notes, '')
`);

db.exec(`
  UPDATE users
  SET
    first_name = COALESCE(first_name, trim(substr(name, 1, instr(name || ' ', ' ') - 1))),
    last_name = COALESCE(last_name, trim(substr(name, instr(name || ' ', ' ') + 1))),
    phone = COALESCE(phone, '01 02 03 04 05'),
    offer_type = COALESCE(offer_type, 'Type d’offre')
`);

db.exec(`
  UPDATE daily_checkins
  SET stress = COALESCE(stress, MAX(1, MIN(5, ROUND((6 - mood + 6 - energy) / 2.0))))
`);

// Create default admin if no admin exists
const adminCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin').count;
if (adminCount === 0) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const insertAdmin = db.prepare(`
    INSERT INTO users (email, password_hash, name, role, password_set)
    VALUES (?, ?, ?, ?, 1)
  `);
  insertAdmin.run('admin@sportcoach.com', hashedPassword, 'Administratrice', 'admin');
}

module.exports = db;
