const express = require('express');
const router = express.Router();
const supabase = require('../src/db');

// Добавить время
router.post('/add', async (req, res) => {
    const { user_id, task_id, work_date, hours_spent, comment } = req.body;
    const { data, error } = await supabase
        .from('time_logs')
        .insert([{ user_id, task_id, work_date, hours_spent, comment }])
        .select();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
});

module.exports = router; // ОБЯЗАТЕЛЬНО ЭТА СТРОКА В КОНЦЕ