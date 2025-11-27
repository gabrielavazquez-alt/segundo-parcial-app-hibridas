const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const { connectDB } = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const instructionRoutes = require('./routes/instruction.routes');
const userRoutes = require('./routes/user.routes');



dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;


// Middlewares base
app.use(cors());
app.use(express.json());

// Ruta de prueba - BORRAR TODO
app.get('/api/health', (req, res) => {
    res.json({ ok: true, message: 'API de Tradu-Flow funcionando 🚀' });
});


app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/instructions', instructionRoutes);
app.use('/api/users', userRoutes);



// Conectar a la DB y después iniciar el servidor
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error('❌ No se pudo iniciar el servidor:', err);
});
