const db = require('../db/database');

const getAdminPrograms = (req, res) => {
  try {
    const programs = db.prepare(`
      SELECT
        p.*,
        COUNT(DISTINCT pa.id) as assignment_count,
        COUNT(DISTINCT w.id) as step_count
      FROM programs p
      LEFT JOIN program_assignments pa ON pa.program_id = p.id
      LEFT JOIN workouts w ON w.program_id = p.id
      GROUP BY p.id
      ORDER BY p.name ASC
    `).all();

    res.json(programs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const createProgram = (req, res) => {
  const {
    name,
    goal,
    level,
    duration_weeks,
    description,
    session_minutes,
    banner_image,
    coach_notes,
    location,
    steps = []
  } = req.body;

  if (!name || !session_minutes) {
    return res.status(400).json({ error: 'Nom et durée de séance requis' });
  }

  try {
    const insertProgram = db.prepare(`
      INSERT INTO programs (name, goal, level, duration_weeks, description, session_minutes, banner_image, coach_notes, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insertProgram.run(
      name,
      goal || 'Coaching personnalisé',
      level || 'débutant',
      Number(duration_weeks) || 1,
      description || '',
      Number(session_minutes),
      banner_image || '',
      coach_notes || '',
      location || 'Domicile'
    );
    const programId = result.lastInsertRowid;

    const insertWorkout = db.prepare(`
      INSERT INTO workouts (program_id, week, day, name, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    steps
      .filter((step) => step?.name?.trim())
      .forEach((step, index) => {
        insertWorkout.run(
          programId,
          1,
          index + 1,
          step.name.trim(),
          step.description?.trim() || ''
        );
      });

    const program = db.prepare('SELECT * FROM programs WHERE id = ?').get(programId);
    res.status(201).json(program);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const updateProgram = (req, res) => {
  const { id } = req.params;
  const {
    name,
    goal,
    level,
    duration_weeks,
    description,
    session_minutes,
    banner_image,
    coach_notes,
    location,
    steps
  } = req.body;

  if (!name || !session_minutes) {
    return res.status(400).json({ error: 'Nom et durée de séance requis' });
  }

  try {
    const existingProgram = db.prepare('SELECT id FROM programs WHERE id = ?').get(id);
    if (!existingProgram) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    db.prepare(`
      UPDATE programs
      SET name = ?, goal = ?, level = ?, duration_weeks = ?, description = ?, session_minutes = ?, banner_image = ?, coach_notes = ?, location = ?
      WHERE id = ?
    `).run(
      name,
      goal || 'Coaching personnalisé',
      level || 'débutant',
      Number(duration_weeks) || 1,
      description || '',
      Number(session_minutes),
      banner_image || '',
      coach_notes || '',
      location || 'Domicile',
      id
    );

    if (Array.isArray(steps)) {
      db.prepare('DELETE FROM exercises WHERE workout_id IN (SELECT id FROM workouts WHERE program_id = ?)').run(id);
      db.prepare('DELETE FROM workouts WHERE program_id = ?').run(id);

      const insertWorkout = db.prepare(`
        INSERT INTO workouts (program_id, week, day, name, description)
        VALUES (?, ?, ?, ?, ?)
      `);

      steps
        .filter((step) => step?.name?.trim())
        .forEach((step, index) => {
          insertWorkout.run(
            id,
            1,
            index + 1,
            step.name.trim(),
            step.description?.trim() || ''
          );
        });
    }

    const program = db.prepare('SELECT * FROM programs WHERE id = ?').get(id);
    res.json(program);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const duplicateProgram = (req, res) => {
  const { id } = req.params;

  try {
    const originalProgram = db.prepare('SELECT * FROM programs WHERE id = ?').get(id);
    if (!originalProgram) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    const insertProgram = db.prepare(`
      INSERT INTO programs (name, goal, level, duration_weeks, description, session_minutes, banner_image, coach_notes, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insertProgram.run(
      `${originalProgram.name} (copie)`,
      originalProgram.goal,
      originalProgram.level,
      originalProgram.duration_weeks,
      originalProgram.description || '',
      originalProgram.session_minutes || 20,
      originalProgram.banner_image || '',
      originalProgram.coach_notes || '',
      originalProgram.location || 'Domicile'
    );

    const newProgramId = result.lastInsertRowid;
    const workouts = db.prepare(`
      SELECT * FROM workouts
      WHERE program_id = ?
      ORDER BY week, day, id
    `).all(id);

    const insertWorkout = db.prepare(`
      INSERT INTO workouts (program_id, week, day, name, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    workouts.forEach((workout) => {
      const workoutResult = insertWorkout.run(
        newProgramId,
        workout.week,
        workout.day,
        workout.name,
        workout.description || ''
      );

      void workoutResult;
    });

    const duplicatedProgram = db.prepare('SELECT * FROM programs WHERE id = ?').get(newProgramId);
    res.status(201).json(duplicatedProgram);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const deleteProgram = (req, res) => {
  const { id } = req.params;

  try {
    const program = db.prepare('SELECT id FROM programs WHERE id = ?').get(id);
    if (!program) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    db.prepare('DELETE FROM assignment_feedback WHERE assignment_id IN (SELECT id FROM program_assignments WHERE program_id = ?)').run(id);
    db.prepare('DELETE FROM program_assignments WHERE program_id = ?').run(id);
    db.prepare('DELETE FROM workouts WHERE program_id = ?').run(id);
    db.prepare('DELETE FROM programs WHERE id = ?').run(id);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const createAssignment = (req, res) => {
  const { program_id, user_id, scheduled_date, start_time, end_time, notes } = req.body;

  if (!program_id || !user_id || !scheduled_date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Programme, client, date et horaires requis' });
  }

  try {
    const program = db.prepare('SELECT id FROM programs WHERE id = ?').get(program_id);
    const user = db.prepare('SELECT id FROM users WHERE id = ? AND role = ?').get(user_id, 'user');

    if (!program) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    const result = db.prepare(`
      INSERT INTO program_assignments (program_id, user_id, scheduled_date, start_time, end_time, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(program_id, user_id, scheduled_date, start_time, end_time, notes || '');

    const assignment = db.prepare(`
      SELECT
        pa.*,
        p.name as program_name,
        u.name as user_name,
        u.email as user_email
      FROM program_assignments pa
      JOIN programs p ON p.id = pa.program_id
      JOIN users u ON u.id = pa.user_id
      WHERE pa.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getAssignments = (req, res) => {
  try {
    const assignments = db.prepare(`
      SELECT
        pa.*,
        p.name as program_name,
        p.goal as program_goal,
        p.location as program_location,
        p.session_minutes,
        u.name as user_name,
        u.email as user_email,
        u.age as user_age,
        u.created_at as user_created_at,
        af.id as feedback_id
      FROM program_assignments pa
      JOIN programs p ON p.id = pa.program_id
      JOIN users u ON u.id = pa.user_id
      LEFT JOIN assignment_feedback af ON af.assignment_id = pa.id AND af.user_id = pa.user_id
      ORDER BY pa.scheduled_date ASC, pa.start_time ASC, pa.id ASC
    `).all();

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  getAdminPrograms,
  createProgram,
  updateProgram,
  duplicateProgram,
  deleteProgram,
  createAssignment,
  getAssignments
};
