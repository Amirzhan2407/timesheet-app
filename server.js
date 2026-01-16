require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const supabase = require('./src/db');
const authRoutes = require('./routes/auth'); // Подключаем логику регистрации/входа

const app = express();
const PORT = process.env.PORT || 3000;

// МИДЛВЕРЫ (Настройки сервера)
app.use(cors()); // Разрешает запросы с разных адресов
app.use(express.json()); // Позволяет серверу понимать JSON-данные

// Подключаем маршруты для авторизации
// Теперь все ссылки из auth.js будут начинаться с /api/auth
app.use('/api/auth', authRoutes);

// Указываем серверу, где лежат файлы фронтенда (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Проверочный маршрут (оставим его для контроля связи с базой)
app.get('/test-connection', async (req, res) => {
    try {
        const { data, error } = await supabase.from('roles').select('*');
        if (error) throw error;
        
        res.json({
            status: "Успех!",
            message: "Сервер подключился к Supabase",
            data: data
        });
    } catch (err) {
        res.status(500).json({
            status: "Ошибка",
            message: err.message
        });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
    console.log(`🔗 Тест базы: http://localhost:${PORT}/test-connection`);
    console.log(`=========================================`);
});