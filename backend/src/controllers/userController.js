const db = require('../db/database');

const computeAgeFromBirthDate = (birthDate) => {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  const dayDelta = today.getDate() - birth.getDate();
  if (monthDelta < 0 || (monthDelta === 0 && dayDelta < 0)) {
    age -= 1;
  }

  return age;
};

const getAllUsers = async (req, res) => {
  try {
    const users = await db.all(`
      SELECT
        u.id,
        u.email,
        u.name,
        u.first_name,
        u.last_name,
        u.birth_date,
        u.age,
        u.weight,
        u.phone,
        u.offer_type,
        u.created_at,
        COUNT(pa.id)::INTEGER as assignment_count,
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
    `, 'user');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getAdminUserDetail = async (req, res) => {
  const { id } = req.params;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const user = await db.get(`
      SELECT
        id,
        email,
        name,
        first_name,
        last_name,
        birth_date,
        age,
        weight,
        phone,
        offer_type,
        created_at
      FROM users
      WHERE id = ? AND role = 'user'
    `, id);

    if (!user) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    const upcomingAssignments = await db.all(`
      SELECT
        pa.*,
        p.name as program_name,
        p.category as program_category,
        p.session_minutes
      FROM program_assignments pa
      JOIN programs p ON p.id = pa.program_id
      WHERE pa.user_id = ? AND pa.scheduled_date >= ?
      ORDER BY pa.scheduled_date ASC, pa.start_time ASC
    `, id, today);

    const historyAssignments = await db.all(`
      SELECT
        pa.*,
        p.name as program_name,
        p.category as program_category,
        p.session_minutes,
        af.difficulty,
        af.pain_notes,
        af.comments,
        af.completed_at
      FROM program_assignments pa
      JOIN programs p ON p.id = pa.program_id
      LEFT JOIN assignment_feedback af ON af.assignment_id = pa.id AND af.user_id = pa.user_id
      WHERE pa.user_id = ? AND (pa.scheduled_date < ? OR af.id IS NOT NULL)
      ORDER BY COALESCE(af.completed_at, pa.scheduled_date::TIMESTAMPTZ) DESC, pa.start_time DESC
    `, id, today);

    const checkins = await db.all(`
      SELECT
        checkin_date,
        mood,
        energy,
        sleep_quality,
        CASE
          WHEN mood IS NOT NULL AND energy IS NOT NULL
          THEN GREATEST(1, LEAST(5, ROUND(((6 - mood) + (6 - energy)) / 2.0)::INTEGER))
          ELSE NULL
        END as stress
      FROM daily_checkins
      WHERE user_id = ?
      ORDER BY checkin_date ASC
      LIMIT 120
    `, id);

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

const updateAdminUser = async (req, res) => {
  const { id } = req.params;
  const { email, first_name, last_name, birth_date, phone, offer_type } = req.body;
  const name = [first_name, last_name].filter(Boolean).join(' ').trim();
  const age = computeAgeFromBirthDate(birth_date);

  if (!name || !email) {
    return res.status(400).json({ error: 'Nom, prénom et email requis' });
  }

  try {
    const existingUser = await db.get('SELECT id FROM users WHERE id = ? AND role = ?', id, 'user');
    if (!existingUser) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    const emailOwner = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', email, id);
    if (emailOwner) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    await db.run(`
      UPDATE users
      SET
        email = ?,
        name = ?,
        first_name = ?,
        last_name = ?,
        birth_date = ?,
        age = ?,
        phone = ?,
        offer_type = ?
      WHERE id = ? AND role = 'user'
    `,
      email,
      name,
      first_name || null,
      last_name || null,
      birth_date || null,
      age,
      phone || null,
      offer_type || null,
      id
    );

    const user = await db.get(`
      SELECT id, email, name, first_name, last_name, birth_date, age, phone, offer_type, created_at
      FROM users
      WHERE id = ?
    `, id);

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { getAllUsers, getAdminUserDetail, updateAdminUser };
