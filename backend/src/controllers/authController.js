const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

const register = async (req, res) => {
  // This route is now disabled for public registration
  return res.status(403).json({ error: 'Inscription publique désactivée. Contactez l\'administratrice.' });
};

const createUser = async (req, res) => {
  const { name, email, age, weight, password, first_name, last_name, birth_date, phone, offer_type } = req.body;

  const fullName = name || [first_name, last_name].filter(Boolean).join(' ').trim();
  const resolvedAge = age || computeAgeFromBirthDate(birth_date);

  if (!fullName || !email) {
    return res.status(400).json({ error: 'Nom et email requis' });
  }

  try {
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    const resolvedPassword = password || ('temp' + Math.random().toString(36).substring(2, 8));
    const hashedPassword = await bcrypt.hash(resolvedPassword, 10);
    const passwordSet = Boolean(password);

    const user = await db.get(`
      INSERT INTO users (email, password_hash, name, first_name, last_name, birth_date, age, weight, phone, offer_type, role, password_set)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user', ?)
      RETURNING id, email, name, first_name, last_name, birth_date, age, weight, phone, offer_type, password_set
    `,
      email,
      hashedPassword,
      fullName,
      first_name || null,
      last_name || null,
      birth_date || null,
      resolvedAge || null,
      weight || null,
      phone || null,
      offer_type || null,
      passwordSet
    );

    res.status(201).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const checkEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }

  try {
    const user = await db.get('SELECT id, email, name, role, password_set FROM users WHERE email = ?', email);
    if (!user) {
      return res.status(404).json({ error: 'Email non trouvé' });
    }

    res.json({ email: user.email, name: user.name, role: user.role, password_set: user.password_set });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (!user) {
      return res.status(401).json({ error: 'Email non trouvé' });
    }

    // If password not set, allow login without password check
    if (!user.password_set) {
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        password_set: user.password_set,
        age: user.age,
        weight: user.weight
      };
      return res.json({ token, user: userData, requires_password_setup: true });
    }

    if (user.password_set && !password) {
      return res.status(400).json({ error: 'Mot de passe requis' });
    }

    // Normal password check
    if (!password || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      password_set: user.password_set,
      age: user.age,
      weight: user.weight
    };

    res.json({ token, user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const setPassword = async (req, res) => {
  const { password } = req.body;
  const userId = req.user.id;

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Mot de passe requis (minimum 6 caractères)' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(`
      UPDATE users 
      SET password_hash = ?, password_set = TRUE 
      WHERE id = ?
    `, hashedPassword, userId);

    res.json({ message: 'Mot de passe défini avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { register, createUser, checkEmail, login, setPassword };
