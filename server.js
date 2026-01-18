require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Подключаем базу данных (из твоего файла src/db.js)
const supabase = require('./src/db'); 

// Импортируем маршруты (логику API)
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const timeRoutes = require('./routes/time');

const app = express();
const PORT = process.env.PORT || 3000;

// --- НАСТРОЙКИ (Middleware) ---
app.use(cors()); // Чтобы браузер не блокировал запросы
app.use(express.json()); // Чтобы сервер понимал JSON данные из форм

// --- ПОДКЛЮЧЕНИЕ API ---
// Все эти маршруты будут обрабатывать запросы с фронтенда
app.use('/api/auth', authRoutes);       // Регистрация и логин
app.use('/api/projects', projectRoutes); // Создание и получение проектов
app.use('/api/tasks', taskRoutes);       // Назначение и получение задач
app.use('/api/time', timeRoutes);        // Сохранение отработанных часов
app.use('/api/reports', require('./routes/reports'));

// --- ОБСЛУЖИВАНИЕ ФРОНТЕНДА (Static Files) ---
// Эта строка делает все файлы в папке 'public' доступными по ссылке
app.use(express.static(path.join(__dirname, 'public')));

// Дополнительный маршрут: если пользователь зашел просто на http://localhost:3000/
// Мы можем автоматически отправить его на главную или страницу логина
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// --- ПРОВЕРОЧНЫЙ МАРШРУТ ---
// Оставим его для контроля связи с облаком Supabase
app.get('/test-connection', async (req, res) => {
    try {
        const { data, error } = await supabase.from('roles').select('*');
        if (error) throw error;
        
        res.json({
            status: "Успех!",
            message: "Сервер Node.js видит базу PostgreSQL в Supabase",
            data: data
        });
    } catch (err) {
        res.status(500).json({
            status: "Ошибка",
            message: err.message
        });
    }
});

// --- ЗАПУСК СЕРВЕРА ---
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 СИСТЕМА TIMESHEET ЗАПУЩЕНА`);
    console.log(`🏠 Адрес входа: http://localhost:${PORT}/login.html`);
    console.log(`📊 Дашборд: http://localhost:${PORT}/index.html`);
    console.log(`🔧 Тест базы: http://localhost:${PORT}/test-connection`);
    console.log(`=================================================`);
});