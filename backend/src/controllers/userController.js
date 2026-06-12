const db = require('../db/database');

const getAllUsers = (req, res) => {
  try {
    const users = db.prepare(`
      SELECT
        u.id,
        u.email,
        u.name,
        u.first_name,
        u.last_name,
        u.birth_date,
        u.age,
        u.weight,
        u.goal,
        u.level,
        u.phone,
        u.offer_type,
        u.created_at,
        COUNT(pa.id) as assignment_count,
        (
          SELECT dc.mood
          FROM daily_checkins dc
          WHERE dc.user_id = u.id
          ORDER BY dc.checkin_date DESC
          LIMIT 1
        ) as latest_mood,
        (
          SELECT dc.checkin_date
          FROM daily_checkins dc
          WHERE dc.user_id = u.id
          ORDER BY dc.checkin_date DESC
          LIMIT 1
        ) as latest_checkin_date
      FROM users u
      LEFT JOIN program_assignments pa ON pa.user_id = u.id
      WHERE u.role = ?
      GROUP BY u.id
      ORDER BY u.name ASC
    `).all('user');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getAdminUserDetail = (req, res) => {
  const { id } = req.params;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const user = db.prepare(`
      SELECT
        id,
        email,
        name,
        first_name,
        last_name,
        birth_date,
        age,
        weight,
        goal,
        level,
        phone,
        offer_type,
        created_at
      FROM users
      WHERE id = ? AND role = 'user'
    `).get(id);

    if (!user) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    const upcomingAssignments = db.prepare(`
      SELECT
        pa.*,
        p.name as program_name,
        p.location as program_location,
        p.session_minutes
      FROM program_assignments pa
      JOIN programs p ON p.id = pa.program_id
      WHERE pa.user_id = ? AND pa.scheduled_date >= ?
      ORDER BY pa.scheduled_date ASC, pa.start_time ASC
    `).all(id, today);

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
        af.completed_at
      FROM program_assignments pa
      JOIN programs p ON p.id = pa.program_id
      LEFT JOIN assignment_feedback af ON af.assignment_id = pa.id AND af.user_id = pa.user_id
      WHERE pa.user_id = ? AND (pa.scheduled_date < ? OR af.id IS NOT NULL)
      ORDER BY COALESCE(af.completed_at, pa.scheduled_date) DESC, pa.start_time DESC
      LIMIT 8
    `).all(id, today);

    const checkins = db.prepare(`
      SELECT
        checkin_date,
        mood,
        energy,
        sleep_quality,
        CASE
          WHEN mood IS NOT NULL AND energy IS NOT NULL
          THEN MAX(1, MIN(5, ROUND((6 - mood + 6 - energy) / 2.0)))
          ELSE NULL
        END as stress
      FROM daily_checkins
      WHERE user_id = ?
      ORDER BY checkin_date DESC
      LIMIT 7
    `).all(id).reverse();

    res.json({
      user,
      upcomingAssignments,
      historyAssignments,
      checkins
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { getAllUsers, getAdminUserDetail };
