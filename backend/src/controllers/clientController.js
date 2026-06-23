const db = require('../db/database');

const getCurrentWeekBounds = (date = new Date()) => {
  const now = new Date(date);
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const formatDateKey = (date) => {
  const current = new Date(date);
  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, '0');
  const day = String(current.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const computeAgeFromBirthDate = (birthDate) => {
  if (!birthDate) return null;

  const birth = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

const clampScore = (value) => Math.max(1, Math.min(5, Number(value) || 3));

const getCurrentWeekCheckins = (userId, start, end) => db.all(
  `
    SELECT
      checkin_date,
      mood,
      energy,
      sleep_quality,
      COALESCE(stress, CASE
        WHEN mood IS NOT NULL AND energy IS NOT NULL
        THEN GREATEST(1, LEAST(5, ROUND(((6 - mood) + (6 - energy)) / 2.0)::INTEGER))
        ELSE NULL
      END) as stress
    FROM daily_checkins
    WHERE user_id = ? AND checkin_date >= ? AND checkin_date <= ?
    ORDER BY checkin_date ASC
  `,
  userId,
  formatDateKey(start),
  formatDateKey(end)
);

const getHomepage = async (req, res) => {
  const userId = req.user.id;
  const today = formatDateKey(new Date());
  const requestedDate = req.query.week ? new Date(`${req.query.week}T12:00:00`) : new Date();
  const { start, end } = getCurrentWeekBounds(requestedDate);

  try {
    const user = await db.get(
      `
        SELECT id, name, first_name, last_name, age, email, phone, created_at
        FROM users
        WHERE id = ?
      `,
      userId
    );

    const [
      weekAssignments,
      featuredAssignment,
      upcomingAssignments,
      latestCheckin,
      todayCheckin,
      checkins
    ] = await Promise.all([
      db.all(
        `
          SELECT
            pa.*,
            p.name as program_name,
            p.category as program_category,
            p.session_minutes,
            af.id as feedback_id
          FROM program_assignments pa
          JOIN programs p ON p.id = pa.program_id
          LEFT JOIN assignment_feedback af ON af.assignment_id = pa.id AND af.user_id = pa.user_id
          WHERE pa.user_id = ? AND pa.scheduled_date >= ? AND pa.scheduled_date <= ?
          ORDER BY pa.scheduled_date ASC, pa.start_time ASC
        `,
        userId,
        formatDateKey(start),
        formatDateKey(end)
      ),
      db.get(
        `
          SELECT
            pa.*,
            p.name as program_name,
            p.category as program_category,
            p.session_minutes,
            af.id as feedback_id
          FROM program_assignments pa
          JOIN programs p ON p.id = pa.program_id
          LEFT JOIN assignment_feedback af ON af.assignment_id = pa.id AND af.user_id = pa.user_id
          WHERE pa.user_id = ? AND pa.scheduled_date >= ?
          ORDER BY
            CASE WHEN pa.scheduled_date = ? THEN 0 ELSE 1 END,
            pa.scheduled_date ASC,
            pa.start_time ASC
          LIMIT 1
        `,
        userId,
        today,
        today
      ),
      db.all(
        `
          SELECT
            pa.*,
            p.name as program_name,
            p.category as program_category,
            p.session_minutes,
            af.id as feedback_id
          FROM program_assignments pa
          JOIN programs p ON p.id = pa.program_id
          LEFT JOIN assignment_feedback af ON af.assignment_id = pa.id AND af.user_id = pa.user_id
          WHERE pa.user_id = ? AND pa.scheduled_date >= ?
          ORDER BY pa.scheduled_date ASC, pa.start_time ASC
          LIMIT 4
        `,
        userId,
        today
      ),
      db.get(
        `
          SELECT *
          FROM daily_checkins
          WHERE user_id = ?
          ORDER BY checkin_date DESC
          LIMIT 1
        `,
        userId
      ),
      db.get(
        `
          SELECT *
          FROM daily_checkins
          WHERE user_id = ? AND checkin_date = ?
        `,
        userId,
        today
      ),
      getCurrentWeekCheckins(userId, start, end)
    ]);

    const daysSinceJoin = Math.max(
      1,
      Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
    );

    res.json({
      user,
      weekAssignments,
      featuredAssignment: featuredAssignment || null,
      upcomingAssignments,
      latestCheckin: latestCheckin || null,
      todayCheckin: todayCheckin || null,
      checkins,
      daysSinceJoin,
      weekRange: {
        start: formatDateKey(start),
        end: formatDateKey(end)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getCalendar = async (req, res) => {
  const userId = req.user.id;

  try {
    const assignments = await db.all(
      `
        SELECT
          pa.*,
          p.name as program_name,
          p.category as program_category,
          p.session_minutes
        FROM program_assignments pa
        JOIN programs p ON p.id = pa.program_id
        WHERE pa.user_id = ?
        ORDER BY pa.scheduled_date ASC, pa.start_time ASC
      `,
      userId
    );

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getProgress = async (req, res) => {
  const userId = req.user.id;
  const requestedDate = req.query.week ? new Date(`${req.query.week}T12:00:00`) : new Date();
  const { start, end } = getCurrentWeekBounds(requestedDate);

  try {
    const user = await db.get(
      `
        SELECT id, name, first_name, last_name, age, email, phone, created_at
        FROM users
        WHERE id = ?
      `,
      userId
    );

    const [weekAssignments, latestCheckin, checkins, historyAssignments, weeklyMinutes] = await Promise.all([
      db.all(
        `
          SELECT
            pa.*,
            p.name as program_name,
            p.category as program_category,
            p.session_minutes
          FROM program_assignments pa
          JOIN programs p ON p.id = pa.program_id
          WHERE pa.user_id = ? AND pa.scheduled_date >= ? AND pa.scheduled_date <= ?
          ORDER BY pa.scheduled_date ASC, pa.start_time ASC
        `,
        userId,
        formatDateKey(start),
        formatDateKey(end)
      ),
      db.get(
        `
          SELECT *
          FROM daily_checkins
          WHERE user_id = ?
          ORDER BY checkin_date DESC
          LIMIT 1
        `,
        userId
      ),
      getCurrentWeekCheckins(userId, start, end),
      db.all(
        `
          SELECT
            pa.*,
            p.name as program_name,
            p.category as program_category,
            p.session_minutes,
            af.difficulty,
            af.pain_notes,
            af.comments,
            af.duration_minutes,
            af.completed_at
          FROM program_assignments pa
          JOIN programs p ON p.id = pa.program_id
          LEFT JOIN assignment_feedback af ON af.assignment_id = pa.id AND af.user_id = pa.user_id
          WHERE pa.user_id = ? AND af.id IS NOT NULL
          ORDER BY af.completed_at DESC
          LIMIT 6
        `,
        userId
      ),
      db.get(
        `
          SELECT COALESCE(SUM(COALESCE(NULLIF(af.duration_minutes, 0), p.session_minutes, 0)), 0)::INTEGER as total
          FROM assignment_feedback af
          JOIN program_assignments pa ON pa.id = af.assignment_id
          JOIN programs p ON p.id = pa.program_id
          WHERE af.user_id = ? AND DATE(af.completed_at) >= ? AND DATE(af.completed_at) <= ?
        `,
        userId,
        formatDateKey(start),
        formatDateKey(end)
      )
    ]);

    const daysSinceJoin = Math.max(
      1,
      Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
    );

    res.json({
      user,
      weekAssignments,
      latestCheckin: latestCheckin || null,
      checkins,
      historyAssignments,
      weeklyCompletedMinutes: weeklyMinutes.total,
      daysSinceJoin,
      weekRange: {
        start: formatDateKey(start),
        end: formatDateKey(end)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getSession = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const assignment = await db.get(
      `
        SELECT
          pa.*,
          p.name as program_name,
          p.category as program_category,
          p.session_minutes,
          p.banner_image,
          p.coach_notes,
          p.description as program_description,
          af.id as feedback_id,
          af.difficulty as feedback_difficulty,
          af.pain_notes as feedback_pain_notes,
          af.comments as feedback_comments,
          af.duration_minutes as feedback_duration_minutes,
          af.completed_at as feedback_completed_at
        FROM program_assignments pa
        JOIN programs p ON p.id = pa.program_id
        LEFT JOIN assignment_feedback af ON af.assignment_id = pa.id AND af.user_id = pa.user_id
        WHERE pa.id = ? AND pa.user_id = ?
      `,
      id,
      userId
    );

    if (!assignment) {
      return res.status(404).json({ error: 'Séance non trouvée' });
    }

    const steps = await db.all(
      `
        SELECT id, name, duration_minutes, description
        FROM workouts
        WHERE program_id = ?
        ORDER BY week ASC, day ASC, id ASC
        LIMIT 6
      `,
      assignment.program_id
    );

    res.json({ assignment, steps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const saveDailyCheckin = async (req, res) => {
  const userId = req.user.id;
  const {
    mood = 4,
    energy = 4,
    stress = 2,
    sleep_quality = 4,
    notes = ''
  } = req.body;
  const checkinDate = req.body.checkin_date || formatDateKey(new Date());

  try {
    const checkin = await db.get(
      `
        INSERT INTO daily_checkins (user_id, checkin_date, mood, energy, sleep_quality, stress, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, checkin_date) DO UPDATE SET
          mood = excluded.mood,
          energy = excluded.energy,
          sleep_quality = excluded.sleep_quality,
          stress = excluded.stress,
          notes = excluded.notes
        RETURNING *
      `,
      userId,
      checkinDate,
      clampScore(mood),
      clampScore(energy),
      clampScore(sleep_quality),
      clampScore(stress),
      notes
    );

    res.status(201).json(checkin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { email, first_name, last_name, birth_date, phone } = req.body;
  const name = [first_name, last_name].filter(Boolean).join(' ').trim();
  const age = computeAgeFromBirthDate(birth_date);

  if (!name || !email) {
    return res.status(400).json({ error: 'Nom, prénom et email requis' });
  }

  try {
    const existingUser = await db.get('SELECT id FROM users WHERE id = ? AND role = ?', userId, 'user');
    if (!existingUser) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    const emailOwner = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', email, userId);
    if (emailOwner) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    const user = await db.get(
      `
        UPDATE users
        SET
          email = ?,
          name = ?,
          first_name = ?,
          last_name = ?,
          birth_date = ?,
          age = ?,
          phone = ?
        WHERE id = ? AND role = 'user'
        RETURNING id, email, name, first_name, last_name, birth_date, age, phone, created_at
      `,
      email,
      name,
      first_name || null,
      last_name || null,
      birth_date || null,
      age,
      phone || null,
      userId
    );

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const completeSession = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const assignment = await db.get(
      `
        SELECT pa.*, p.session_minutes
        FROM program_assignments pa
        JOIN programs p ON p.id = pa.program_id
        WHERE pa.id = ? AND pa.user_id = ?
      `,
      id,
      userId
    );

    if (!assignment) {
      return res.status(404).json({ error: 'Séance non trouvée' });
    }

    const feedback = await db.get(
      `
        INSERT INTO assignment_feedback (assignment_id, user_id, difficulty, pain_notes, comments, duration_minutes)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(assignment_id, user_id) DO UPDATE SET
          difficulty = excluded.difficulty,
          pain_notes = excluded.pain_notes,
          comments = excluded.comments,
          duration_minutes = excluded.duration_minutes,
          completed_at = CURRENT_TIMESTAMP
        RETURNING *
      `,
      id,
      userId,
      req.body.difficulty || 2,
      req.body.pain_notes || '',
      req.body.comments || '',
      req.body.duration_minutes || assignment.session_minutes || 0
    );

    res.status(201).json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  getHomepage,
  getCalendar,
  getProgress,
  getSession,
  saveDailyCheckin,
  updateProfile,
  completeSession
};
