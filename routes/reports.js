const express = require('express');
const router = express.Router();
const supabase = require('../src/db');

// Получить полную статистику по конкретному проекту
router.get('/project/:id', async (req, res) => {
    try {
        const projectId = req.params.id;

        // 1. Получаем все логи времени для задач этого проекта
        const { data: logs, error } = await supabase
            .from('time_logs')
            .select(`
                hours_spent,
                work_date,
                comment,
                users(full_name),
                tasks(category, project_id)
            `)
            .eq('tasks.project_id', projectId);

        if (error) throw error;

        // Фильтруем логи, которые реально относятся к нашему проекту (из-за особенностей join в supabase)
        const projectLogs = logs.filter(log => log.tasks !== null);

        if (projectLogs.length === 0) {
            return res.json({ empty: true });
        }

        // 2. Считаем статистику
        const totalHours = projectLogs.reduce((sum, log) => sum + parseFloat(log.hours_spent), 0);
        const dates = projectLogs.map(l => new Date(l.work_date));
        const startDate = new Date(Math.min(...dates)).toLocaleDateString();
        const endDate = new Date(Math.max(...dates)).toLocaleDateString();

        // Группировка по сотрудникам
        const userStats = {};
        projectLogs.forEach(log => {
            const name = log.users.full_name;
            if (!userStats[name]) userStats[name] = 0;
            userStats[name] += parseFloat(log.hours_spent);
        });

        const employeeList = Object.keys(userStats).map(name => ({
            name,
            hours: userStats[name]
        }));

        res.json({
            projectName: projectLogs[0].tasks.projects?.name || "Проект",
            period: `${startDate} — ${endDate}`,
            totalHours,
            averageHours: (totalHours / employeeList.length).toFixed(1),
            employeeList,
            details: projectLogs
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;