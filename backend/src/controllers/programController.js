const db = require('../db/database');
const { deleteProgramImageFile } = require('./uploadController');

const deleteProgramImageIfUnused = (imageUrl) => {
  if (!imageUrl) return;

  const references = db.prepare('SELECT COUNT(*) as count FROM programs WHERE banner_image = ?').get(imageUrl).count;
  if (references === 0) {
    deleteProgramImageFile(imageUrl);
  }
};

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

const getAdminProgramDetail = (req, res) => {
  const { id } = req.params;

  try {
    const program = db.prepare(`
      SELECT
        p.*,
        COUNT(DISTINCT pa.id) as assignment_count
      FROM programs p
      LEFT JOIN program_assignments pa ON pa.program_id = p.id
      WHERE p.id = ?
      GROUP BY p.id
    `).get(id);

    if (!program) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    const steps = db.prepare(`
      SELECT id, week, day, name, duration_minutes, description
      FROM workouts
      WHERE program_id = ?
      ORDER BY week ASC, day ASC, id ASC
    `).all(id);

    const assignments = db.prepare(`
      SELECT
        pa.id,
        pa.scheduled_date,
        pa.start_time,
        pa.end_time,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        af.id as feedback_id
      FROM program_assignments pa
      JOIN users u ON u.id = pa.user_id
      LEFT JOIN assignment_feedback af ON af.assignment_id = pa.id AND af.user_id = pa.user_id
      WHERE pa.program_id = ?
      ORDER BY pa.scheduled_date DESC, pa.start_time ASC
      LIMIT 8
    `).all(id);

    res.json({ program, steps, assignments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const createProgram = (req, res) => {
  const {
    name,
    category,
    description,
    session_minutes,
    banner_image,
    coach_notes,
    steps = []
  } = req.body;

  if (!name || !session_minutes || !category) {
    return res.status(400).json({ error: 'Nom, durée et catégorie requis' });
  }

  try {
    const insertProgram = db.prepare(`
      INSERT INTO programs (name, category, description, session_minutes, banner_image, coach_notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = insertProgram.run(
      name,
      category,
      description || '',
      Number(session_minutes),
      banner_image || '',
      coach_notes || ''
    );
    const programId = result.lastInsertRowid;

    const insertWorkout = db.prepare(`
      INSERT INTO workouts (program_id, week, day, name, duration_minutes, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    steps
      .filter((step) => step?.name?.trim())
      .forEach((step, index) => {
        insertWorkout.run(
          programId,
          1,
          index + 1,
          step.name.trim(),
          Number(step.duration) || 0,
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
    category,
    description,
    session_minutes,
    banner_image,
    coach_notes,
    steps
  } = req.body;

  if (!name || !session_minutes || !category) {
    return res.status(400).json({ error: 'Nom, durée et catégorie requis' });
  }

  try {
    const existingProgram = db.prepare('SELECT id, banner_image FROM programs WHERE id = ?').get(id);
    if (!existingProgram) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    db.prepare(`
      UPDATE programs
      SET name = ?, category = ?, description = ?, session_minutes = ?, banner_image = ?, coach_notes = ?
      WHERE id = ?
    `).run(
      name,
      category,
      description || '',
      Number(session_minutes),
      banner_image || '',
      coach_notes || '',
      id
    );

    if (existingProgram.banner_image && existingProgram.banner_image !== (banner_image || '')) {
      deleteProgramImageIfUnused(existingProgram.banner_image);
    }

    if (Array.isArray(steps)) {
      db.prepare('DELETE FROM exercises WHERE workout_id IN (SELECT id FROM workouts WHERE program_id = ?)').run(id);
      db.prepare('DELETE FROM workouts WHERE program_id = ?').run(id);

      const insertWorkout = db.prepare(`
        INSERT INTO workouts (program_id, week, day, name, duration_minutes, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      steps
        .filter((step) => step?.name?.trim())
        .forEach((step, index) => {
          insertWorkout.run(
            id,
            1,
            index + 1,
            step.name.trim(),
            Number(step.duration) || 0,
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
      INSERT INTO programs (name, category, description, session_minutes, banner_image, coach_notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = insertProgram.run(
      `${originalProgram.name} (copie)`,
      originalProgram.category,
      originalProgram.description || '',
      originalProgram.session_minutes || 20,
      originalProgram.banner_image || '',
      originalProgram.coach_notes || ''
    );

    const newProgramId = result.lastInsertRowid;
    const workouts = db.prepare(`
      SELECT * FROM workouts
      WHERE program_id = ?
      ORDER BY week, day, id
    `).all(id);

    const insertWorkout = db.prepare(`
      INSERT INTO workouts (program_id, week, day, name, duration_minutes, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    workouts.forEach((workout) => {
      const workoutResult = insertWorkout.run(
        newProgramId,
        workout.week,
        workout.day,
        workout.name,
        workout.duration_minutes || 0,
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
    const program = db.prepare('SELECT id, banner_image FROM programs WHERE id = ?').get(id);
    if (!program) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    db.prepare('DELETE FROM assignment_feedback WHERE assignment_id IN (SELECT id FROM program_assignments WHERE program_id = ?)').run(id);
    db.prepare('DELETE FROM program_assignments WHERE program_id = ?').run(id);
    db.prepare('DELETE FROM workouts WHERE program_id = ?').run(id);
    db.prepare('DELETE FROM programs WHERE id = ?').run(id);
    deleteProgramImageIfUnused(program.banner_image);

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

const getAdminAssignmentDetail = (req, res) => {
  const { id } = req.params;

  try {
    const assignment = db.prepare(`
      SELECT
        pa.*,
        p.name as program_name,
        p.category as program_category,
        p.session_minutes,
        p.banner_image,
        p.coach_notes,
        p.description as program_description,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        af.id as feedback_id,
        af.difficulty as feedback_difficulty,
        af.pain_notes as feedback_pain_notes,
        af.comments as feedback_comments,
        af.duration_minutes as feedback_duration_minutes,
        af.completed_at as feedback_completed_at
      FROM program_assignments pa
      JOIN programs p ON p.id = pa.program_id
      JOIN users u ON u.id = pa.user_id
      LEFT JOIN assignment_feedback af ON af.assignment_id = pa.id AND af.user_id = pa.user_id
      WHERE pa.id = ?
    `).get(id);

    if (!assignment) {
      return res.status(404).json({ error: 'Séance non trouvée' });
    }

    const steps = db.prepare(`
      SELECT id, name, duration_minutes, description
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

const getAssignments = (req, res) => {
  try {
    const assignments = db.prepare(`
      SELECT
        pa.*,
        p.name as program_name,
        p.category as program_category,
        p.session_minutes,
        u.name as user_name,
        u.email as user_email,
        u.age as user_age,
        u.created_at as user_created_at,
        dc.mood as checkin_mood,
        dc.energy as checkin_energy,
        dc.sleep_quality as checkin_sleep_quality,
        dc.stress as checkin_stress,
        dc.notes as checkin_notes,
        af.id as feedback_id,
        af.difficulty as feedback_difficulty,
        af.pain_notes as feedback_pain_notes,
        af.comments as feedback_comments,
        af.duration_minutes as feedback_duration_minutes,
        af.completed_at as feedback_completed_at
      FROM program_assignments pa
      JOIN programs p ON p.id = pa.program_id
      JOIN users u ON u.id = pa.user_id
      LEFT JOIN daily_checkins dc ON dc.user_id = pa.user_id AND dc.checkin_date = pa.scheduled_date
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
  getAdminProgramDetail,
  createProgram,
  updateProgram,
  duplicateProgram,
  deleteProgram,
  createAssignment,
  getAdminAssignmentDetail,
  getAssignments
};
