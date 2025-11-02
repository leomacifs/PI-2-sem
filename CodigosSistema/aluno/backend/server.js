const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend')); // Serve seus arquivos frontend

// Rotas
const alunoRoutes = require('./routes/alunoRoutes');
app.use('/api/alunos', alunoRoutes);

// Rota inicial
app.get('/', (req, res) => {
    res.sendFile('Página_Inicial_A.html', { root: '../frontend' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Sistema de Biblioteca Universitária`);
});