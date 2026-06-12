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

const getCurrentWeekCheckins = (userId, start, end) => db.prepare(`
  SELECT
    checkin_date,
    mood,
    energy,
    sleep_quality,
    COALESCE(stress, CASE
      WHEN mood IS NOT NULL AND energy IS NOT NULL
      THEN MAX(1, MIN(5, ROUND((6 - mood + 6 - energy) / 2.0)))
      ELSE NULL
    END) as stress
  FROM daily_checkins
  WHERE user_id = ? AND checkin_date >= ? AND checkin_date <= ?
  ORDER BY checkin_date ASC
`).all(userId, formatDateKey(start), formatDateKey(end));

const getHomepage = (req, res) => {
  const userId = req.user.id;
  const today = formatDateKey(new Date());
  const requestedDate = req.query.week ? new Date(`${req.query.week}T12:00:00`) : new Date();
  const { start, end } = getCurrentWeekBounds(requestedDate);

  try {
    const user = db.prepare(`
      SELECT id, name, first_name, last_name, age, email, phone, offer_type, created_at
      FROM users
      WHERE id = ?
    `).get(userId);

    const weekAssignments = db.prepare(`
      SELECT
        pa.*,
        p.name as program_name,
        p.location as program_location,
        p.session_minutes,
        af.id as feedback_id
      FROM program_assignments pa
      JOIN programs p ON p.id = pa.program_id
      LEFT JOIN assignment_feedback af ON af.assignment_id = pa.id AND af.user_id = pa.user_id
      WHERE pa.user_id = ? AND pa.scheduled_date >= ? AND pa.scheduled_date <= ?
      ORDER BY pa.scheduled_date ASC, pa.start_time ASC
    `).all(userId, formatDateKey(start), formatDateKey(end));

    const featuredAssignment = db.prepare(`
      SELECT
        pa.*,
        p.name as program_name,
        p.location as program_location,
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
    `).get(userId, today, today);

    const upcomingAssignments = db.prepare(`
      SELECT
        pa.*,
        p.name as program_name,
        p.location as program_location,
        p.session_minutes,
        af.id as feedback_id
      FROM program_assignments pa
      JOIN programs p ON p.id = pa.program_id
      LEFT JOIN assignment_feedback af ON af.assignment_id = pa.id AND af.user_id = pa.user_id
      WHERE pa.user_id = ? AND pa.scheduled_date >= ?
      ORDER BY pa.scheduled_date ASC, pa.start_time ASC
      LIMIT 4
    `).all(userId, today);

    const latestCheckin = db.prepare(`
      SELECT *
      FROM daily_checkins
      WHERE user_id = ?
      ORDER BY checkin_date DESC
      LIMIT 1
    `).get(userId);

    const todayCheckin = db.prepare(`
      SELECT *
      FROM daily_checkins
      WHERE user_id = ? AND checkin_date = ?
    `).get(userId, today);

    const checkins = getCurrentWeekCheckins(userId, start, end);

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

const getCalendar = (req, res) => {
  const userId = req.user.id;

  try {
    const assignments = db.prepare(`
      SELECT
        pa.*,
        p.name as program_name,
        p.location as program_location,
        p.session_minutes
      FROM program_assignments pa
      JOIN programs p ON p.id = pa.program_id
      WHERE pa.user_id = ?
      ORDER BY pa.scheduled_date ASC, pa.start_time ASC
    `).all(userId);

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getProgress = (req, res) => {
  const userId = req.user.id;
  const requestedDate = req.query.week ? new Date(`${req.query.week}T12:00:00`) : new Date();
  const { start, end } = getCurrentWeekBounds(requestedDate);

  try {
    const user = db.prepare(`
      SELECT id, name, first_name, last_name, age, email, phone, offer_type, created_at
      FROM users
      WHERE id = ?
    `).get(userId);

    const weekAssignments = db.prepare(`
      SELECT
        pa.*,
        p.name as program_name,
        p.location as program_location,
        p.session_minutes
      FROM program_assignments pa
      JOIN programs p ON p.id = pa.program_id
      WHERE pa.user_id = ? AND pa.scheduled_date >= ? AND pa.scheduled_date <= ?
      ORDER BY pa.scheduled_date ASC, pa.start_time ASC
    `).all(userId, formatDateKey(start), formatDateKey(end));

    const latestCheckin = db.prepare(`
      SELECT *
      FROM daily_checkins
      WHERE user_id = ?
      ORDER BY checkin_date DESC
      LIMIT 1
    `).get(userId);

    const checkins = getCurrentWeekCheckins(userId, start, end);

    const historyAssignments = db.prepare(`
      SELECT
        pa.*,
        p.name as program_name,
        p.location as program_location,
        p.session_minutes,
        af.difficulty,
        af.fatigue,
        af.pain,
        af.comments,
        af.duration_minutes,
        af.completed_at
      FROM program_assignments pa
      JOIN programs p ON p.id = pa.program_id
      LEFT JOIN assignment_feedback af ON af.assignment_id = pa.id AND af.user_id = pa.user_id
      WHERE pa.user_id = ? AND af.id IS NOT NULL
      ORDER BY af.completed_at DESC
      LIMIT 6
    `).all(userId);

    const weeklyCompletedMinutes = db.prepare(`
      SELECT COALESCE(SUM(COALESCE(NULLIF(af.duration_minutes, 0), p.session_minutes, 0)), 0) as total
      FROM assignment_feedback af
      JOIN program_assignments pa ON pa.id = af.assignment_id
      JOIN programs p ON p.id = pa.program_id
      WHERE af.user_id = ? AND DATE(af.completed_at) >= ? AND DATE(af.completed_at) <= ?
    `).get(userId, formatDateKey(start), formatDateKey(end)).total;

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
      weeklyCompletedMinutes,
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

const getSession = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const assignment = db.prepare(`
      SELECT
        pa.*,
        p.name as program_name,
        p.location as program_location,
        p.session_minutes,
        p.coach_notes,
        p.description as program_description,
        af.id as feedback_id
      FROM program_assignments pa
      JOIN programs p ON p.id = pa.program_id
      LEFT JOIN assignment_feedback af ON af.assignment_id = pa.id AND af.user_id = pa.user_id
      WHERE pa.id = ? AND pa.user_id = ?
    `).get(id, userId);

    if (!assignment) {
      return res.status(404).json({ error: 'Séance non trouvée' });
    }

    const steps = db.prepare(`
      SELECT id, name, description
      FROM workouts
      WHERE program_id = ?
      ORDER BY week ASC, day ASC, id ASC
      LIMIT 6
    `).all(assignment.program_id);

    res.json({ assignment, steps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const saveDailyCheckin = (req, res) => {
  const userId = req.user.id;
  const {
    mood = 4,
    energy = 4,
    stress = 2,
    sleep_quality = 4,
    notes = ''
  } = req.body;
  const checkinDate = req.body.checkin_date || formatDateKey(new Date());

  const clampScore = (value) => Math.max(1, Math.min(5, Number(value) || 3));

  try {
    const result = db.prepare(`
      INSERT INTO daily_checkins (user_id, checkin_date, mood, energy, sleep_quality, stress, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, checkin_date) DO UPDATE SET
        mood = excluded.mood,
        energy = excluded.energy,
        sleep_quality = excluded.sleep_quality,
        stress = excluded.stress,
        notes = excluded.notes
    `).run(
      userId,
      checkinDate,
      clampScore(mood),
      clampScore(energy),
      clampScore(sleep_quality),
      clampScore(stress),
      notes
    );

    const checkin = db.prepare(`
      SELECT *
      FROM daily_checkins
      WHERE user_id = ? AND checkin_date = ?
    `).get(userId, checkinDate);

    res.status(result.changes ? 201 : 200).json(checkin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const completeSession = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const assignment = db.prepare(`
      SELECT pa.*, p.session_minutes
      FROM program_assignments pa
      JOIN programs p ON p.id = pa.program_id
      WHERE pa.id = ? AND pa.user_id = ?
    `).get(id, userId);

    if (!assignment) {
      return res.status(404).json({ error: 'Séance non trouvée' });
    }

    db.prepare(`
      INSERT INTO assignment_feedback (assignment_id, user_id, difficulty, fatigue, pain, comments, duration_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(assignment_id, user_id) DO UPDATE SET
        difficulty = excluded.difficulty,
        fatigue = excluded.fatigue,
        pain = excluded.pain,
        comments = excluded.comments,
        duration_minutes = excluded.duration_minutes,
        completed_at = CURRENT_TIMESTAMP
    `).run(
      id,
      userId,
      req.body.difficulty || 2,
      req.body.fatigue || 2,
      req.body.pain || 1,
      req.body.comments || '',
      req.body.duration_minutes || assignment.session_minutes || 0
    );

    const feedback = db.prepare(`
      SELECT *
      FROM assignment_feedback
      WHERE assignment_id = ? AND user_id = ?
    `).get(id, userId);

    res.status(201).json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { getHomepage, getCalendar, getProgress, getSession, saveDailyCheckin, completeSession };
