const db = require('../db/database');
const { deleteProgramImageFile } = require('./uploadController');

const deleteProgramImageIfUnused = async (imageUrl) => {
  if (!imageUrl) return;

  const references = await db.get(
    'SELECT COUNT(*)::INTEGER as count FROM programs WHERE banner_image = ?',
    imageUrl
  );

  if (references.count === 0) {
    deleteProgramImageFile(imageUrl);
  }
};

const insertProgramSteps = async (executor, programId, steps = []) => {
  const cleanedSteps = steps.filter((step) => step?.name?.trim());

  for (const [index, step] of cleanedSteps.entries()) {
    await executor.run(
      `
        INSERT INTO workouts (program_id, week, day, name, duration_minutes, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      programId,
      1,
      index + 1,
      step.name.trim(),
      Number(step.duration ?? step.duration_minutes) || 0,
      step.description?.trim() || ''
    );
  }
};

const getAdminPrograms = async (req, res) => {
  try {
    const programs = await db.all(`
      SELECT
        p.*,
        COUNT(DISTINCT pa.id)::INTEGER as assignment_count,
        COUNT(DISTINCT w.id)::INTEGER as step_count
      FROM programs p
      LEFT JOIN program_assignments pa ON pa.program_id = p.id
      LEFT JOIN workouts w ON w.program_id = p.id
      GROUP BY p.id
      ORDER BY p.name ASC
    `);

    res.json(programs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getAdminProgramDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const program = await db.get(
      `
        SELECT
          p.*,
          COUNT(DISTINCT pa.id)::INTEGER as assignment_count
        FROM programs p
        LEFT JOIN program_assignments pa ON pa.program_id = p.id
        WHERE p.id = ?
        GROUP BY p.id
      `,
      id
    );

    if (!program) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    const steps = await db.all(
      `
        SELECT id, week, day, name, duration_minutes, description
        FROM workouts
        WHERE program_id = ?
        ORDER BY week ASC, day ASC, id ASC
      `,
      id
    );

    const assignments = await db.all(
      `
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
      `,
      id
    );

    res.json({ program, steps, assignments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const createProgram = async (req, res) => {
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
    const program = await db.transaction(async (tx) => {
      const created = await tx.get(
        `
          INSERT INTO programs (name, category, description, session_minutes, banner_image, coach_notes)
          VALUES (?, ?, ?, ?, ?, ?)
          RETURNING *
        `,
        name,
        category,
        description || '',
        Number(session_minutes),
        banner_image || '',
        coach_notes || ''
      );

      await insertProgramSteps(tx, created.id, steps);
      return created;
    });

    res.status(201).json(program);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const updateProgram = async (req, res) => {
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
    const existingProgram = await db.get('SELECT id, banner_image FROM programs WHERE id = ?', id);
    if (!existingProgram) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    const program = await db.transaction(async (tx) => {
      await tx.run(
        `
          UPDATE programs
          SET name = ?, category = ?, description = ?, session_minutes = ?, banner_image = ?, coach_notes = ?
          WHERE id = ?
        `,
        name,
        category,
        description || '',
        Number(session_minutes),
        banner_image || '',
        coach_notes || '',
        id
      );

      if (Array.isArray(steps)) {
        await tx.run('DELETE FROM workouts WHERE program_id = ?', id);
        await insertProgramSteps(tx, id, steps);
      }

      return tx.get('SELECT * FROM programs WHERE id = ?', id);
    });

    if (existingProgram.banner_image && existingProgram.banner_image !== (banner_image || '')) {
      await deleteProgramImageIfUnused(existingProgram.banner_image);
    }

    res.json(program);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const duplicateProgram = async (req, res) => {
  const { id } = req.params;

  try {
    const duplicatedProgram = await db.transaction(async (tx) => {
      const originalProgram = await tx.get('SELECT * FROM programs WHERE id = ?', id);
      if (!originalProgram) return null;

      const duplicate = await tx.get(
        `
          INSERT INTO programs (name, category, description, session_minutes, banner_image, coach_notes)
          VALUES (?, ?, ?, ?, ?, ?)
          RETURNING *
        `,
        `${originalProgram.name} (copie)`,
        originalProgram.category,
        originalProgram.description || '',
        originalProgram.session_minutes || 20,
        originalProgram.banner_image || '',
        originalProgram.coach_notes || ''
      );

      const workouts = await tx.all(
        `
          SELECT *
          FROM workouts
          WHERE program_id = ?
          ORDER BY week, day, id
        `,
        id
      );

      for (const workout of workouts) {
        await tx.run(
          `
            INSERT INTO workouts (program_id, week, day, name, duration_minutes, description)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          duplicate.id,
          workout.week,
          workout.day,
          workout.name,
          workout.duration_minutes || 0,
          workout.description || ''
        );
      }

      return duplicate;
    });

    if (!duplicatedProgram) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    res.status(201).json(duplicatedProgram);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const deleteProgram = async (req, res) => {
  const { id } = req.params;

  try {
    const program = await db.get('SELECT id, banner_image FROM programs WHERE id = ?', id);
    if (!program) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    await db.run('DELETE FROM programs WHERE id = ?', id);
    await deleteProgramImageIfUnused(program.banner_image);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const createAssignment = async (req, res) => {
  const { program_id, user_id, scheduled_date, start_time, end_time, notes } = req.body;

  if (!program_id || !user_id || !scheduled_date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Programme, client, date et horaires requis' });
  }

  try {
    const program = await db.get('SELECT id FROM programs WHERE id = ?', program_id);
    const user = await db.get('SELECT id FROM users WHERE id = ? AND role = ?', user_id, 'user');

    if (!program) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    const created = await db.get(
      `
        INSERT INTO program_assignments (program_id, user_id, scheduled_date, start_time, end_time, notes)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING id
      `,
      program_id,
      user_id,
      scheduled_date,
      start_time,
      end_time,
      notes || ''
    );

    const assignment = await db.get(
      `
        SELECT
          pa.*,
          p.name as program_name,
          u.name as user_name,
          u.email as user_email
        FROM program_assignments pa
        JOIN programs p ON p.id = pa.program_id
        JOIN users u ON u.id = pa.user_id
        WHERE pa.id = ?
      `,
      created.id
    );

    res.status(201).json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getAdminAssignmentDetail = async (req, res) => {
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
      `,
      id
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

const getAssignments = async (req, res) => {
  try {
    const assignments = await db.all(`
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
    `);

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
