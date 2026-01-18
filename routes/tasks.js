const express = require('express');
const router = express.Router();
const supabase = require('../src/db');

// 1. Список сотрудников (исключая текущего Админа)
// Используется в мастере создания проекта
router.get('/employees/:adminId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, full_name')
            .neq('id', req.params.adminId); // Убираем самого админа из списка

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2. Создание задачи (Шаг 2 в мастере создания проекта)
router.post('/create', async (req, res) => {
    const { project_id, assigned_to, category, description } = req.body;
    try {
        const { data, error } = await supabase
            .from('tasks')
            .insert([{ 
                project_id, 
                assigned_to, 
                category, 
                description, 
                title: 'Задача этапа', 
                status: 'В работе' 
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. Задачи конкретного сотрудника (для Исполнителя)
router.get('/my/:userId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*, projects(*)')
            .eq('assigned_to', req.params.userId);

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. ВООБЩЕ ВСЕ задачи со связью с пользователями (для мониторинга Админом)
// Это нужно для отрисовки имен на линии времени (Проектировщик: Иван и т.д.)
router.get('/all', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                projects(*),
                users(full_name)
            `); // Важно: тянем имя пользователя через связь
        
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;