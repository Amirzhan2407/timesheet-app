const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../src/db');

// Секретный ключ для токенов (в реальном проекте вынеси в .env)
const JWT_SECRET = 'your_super_secret_key';

// ФУНКЦИЯ РЕГИСТРАЦИИ
router.post('/register', async (req, res) => {
    const { full_name, email, password, role_id } = req.body;

    try {
        // 1. Хешируем пароль
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Сохраняем пользователя в Supabase
        const { data, error } = await supabase
            .from('users')
            .insert([
                { 
                    full_name, 
                    email, 
                    password_hash: hashedPassword, 
                    role_id: role_id || 2 // По умолчанию 2 (employee)
                }
            ])
            .select();

        if (error) throw error;

        res.status(201).json({ message: "Пользователь создан!", user: data[0] });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ФУНКЦИЯ ВХОДА (LOGIN)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Ищем пользователя по email
        const { data: user, error } = await supabase
            .from('users')
            .select('*, roles(name)')
            .eq('email', email)
            .single();

        if (error || !user) return res.status(400).json({ error: "Пользователь не найден" });

        // 2. Проверяем пароль
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ error: "Неверный пароль" });

        // 3. Создаем токен (пропуск), чтобы система "узнавала" человека
        const token = jwt.sign(
            { id: user.id, role: user.roles.name }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                role: user.roles.name
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;