require('dotenv').config();

const { execFileSync } = require('child_process');
const path = require('path');
const { pool } = require('../src/db/database');

const sqlitePath = process.argv[2] || path.join(__dirname, '../coaching.db');

const tables = [
  {
    name: 'users',
    columns: [
      'id',
      'email',
      'password_hash',
      'name',
      'first_name',
      'last_name',
      'birth_date',
      'role',
      'password_set',
      'age',
      'weight',
      'phone',
      'created_at'
    ],
    booleanColumns: ['password_set']
  },
  {
    name: 'programs',
    columns: ['id', 'name', 'category', 'description', 'session_minutes', 'banner_image', 'coach_notes']
  },
  {
    name: 'workouts',
    columns: ['id', 'program_id', 'week', 'day', 'name', 'duration_minutes', 'description']
  },
  {
    name: 'program_assignments',
    columns: ['id', 'program_id', 'user_id', 'scheduled_date', 'start_time', 'end_time', 'notes', 'created_at']
  },
  {
    name: 'daily_checkins',
    columns: ['id', 'user_id', 'checkin_date', 'mood', 'energy', 'sleep_quality', 'stress', 'notes', 'created_at']
  },
  {
    name: 'assignment_feedback',
    columns: ['id', 'assignment_id', 'user_id', 'difficulty', 'pain_notes', 'comments', 'duration_minutes', 'completed_at']
  }
];

const readSqliteTable = (tableName) => {
  const output = execFileSync('sqlite3', ['-json', sqlitePath, `SELECT * FROM ${tableName}`], {
    encoding: 'utf8'
  });

  return output.trim() ? JSON.parse(output) : [];
};

const normalizeRow = (row, table) => table.columns.map((column) => {
  if (table.booleanColumns?.includes(column)) {
    return Boolean(row[column]);
  }

  if (column === 'category' && !row[column]) {
    return 'Course à pied';
  }

  if (column === 'session_minutes' && !row[column]) {
    return 20;
  }

  if (column === 'coach_notes' && row[column] == null) {
    return '';
  }

  return row[column] ?? null;
});

const placeholders = (count) => Array.from({ length: count }, (_, index) => `$${index + 1}`).join(', ');

const migrate = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(`
      TRUNCATE TABLE
        assignment_feedback,
        daily_checkins,
        program_assignments,
        workouts,
        programs,
        users
      RESTART IDENTITY CASCADE
    `);

    for (const table of tables) {
      const rows = readSqliteTable(table.name);
      const quotedColumns = table.columns.map((column) => `"${column}"`).join(', ');
      const insertSql = `
        INSERT INTO ${table.name} (${quotedColumns})
        VALUES (${placeholders(table.columns.length)})
      `;

      for (const row of rows) {
        await client.query(insertSql, normalizeRow(row, table));
      }

      if (rows.length > 0) {
        await client.query(
          `SELECT setval(pg_get_serial_sequence($1, 'id'), (SELECT MAX(id) FROM ${table.name}))`,
          [table.name]
        );
      }

      console.log(`${table.name}: ${rows.length} lignes migrées`);
    }

    await client.query('COMMIT');
    console.log('Migration SQLite -> PostgreSQL terminée.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration annulée:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
