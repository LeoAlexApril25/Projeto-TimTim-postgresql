const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        res.status(201).json({ success: true, id: result.insertId, message: 'Usuário criado com sucesso' });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'E-mail já cadastrado' });
        res.status(500).json({ error: 'Erro ao registrar usuário', detalhes: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ error: 'E-mail ou senha incorretos' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'E-mail ou senha incorretos' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: 'Erro no login', detalhes: err.message });
    }
};

const forgotPassword = async (req, res) => {
    res.status(501).json({ error: 'Funcionalidade não configurada' });
};

const resetPassword = async (req, res) => {
    res.status(501).json({ error: 'Funcionalidade não configurada' });
};

module.exports = { register, login, forgotPassword, resetPassword };
