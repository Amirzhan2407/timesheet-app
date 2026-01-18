const express = require('express');
const router = express.Router();
const supabase = require('../src/db');

// 1. Получить все проекты
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
    res.json(data || []);
});

// 2. Создать проект
router.post('/', async (req, res) => {
    const { name } = req.body;
    const { data, error } = await supabase
        .from('projects')
        .insert([{ name, current_stage: 'Проектировщик' }])
        .select();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
});

// 3. ПРЯМОЙ ПЕРЕХОД (Сотрудник сам передвигает проект)
router.patch('/next-stage/:id', async (req, res) => {
    const stages = ['Проектировщик', 'Дизайнер', 'Разработчик', 'Тестировщик', 'Завершено'];
    const { current_stage } = req.body; // Стадия, которую завершили
    
    let nextIdx = stages.indexOf(current_stage) + 1;
    const nextStage = stages[nextIdx] || 'Завершено';

    const { data, error } = await supabase
        .from('projects')
        .update({ current_stage: nextStage })
        .eq('id', req.params.id)
        .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
});

// 4. УДАЛЕНИЕ ПРОЕКТА
router.delete('/:id', async (req, res) => {
    const { error } = await supabase.from('projects').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Удалено" });
});

module.exports = router;