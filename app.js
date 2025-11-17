const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../aluno')));
app.use(express.static(path.join(__dirname, '../bibliotecario')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Importar e usar rotas
const alunoRoutes = require('./routes/alunoRoutes');
app.use('/api/alunos', alunoRoutes);

// Rotas básicas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../aluno/Página_Inicial_A.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../bibliotecario/Página_Inicial_B.html'));
});

// Rota de status
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor funcionando!',
        timestamp: new Date().toLocaleString('pt-BR')
    });
});

// Rota de teste do banco
app.get('/api/teste-banco', (req, res) => {
    const db = require('./config/database');
    db.query('SELECT 1 as result', (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro no banco: ' + err.message
            });
        }
        res.json({
            success: true,
            message: 'Banco conectado!',
            data: results
        });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('=================================');
    console.log('SERVIDOR RODANDO NA PORTA 3001!');
    console.log('http://localhost:3001');
    console.log('Sistema Aluno: http://localhost:3001/');
    console.log('API Status: http://localhost:3001/api/status');
    console.log('=================================');
});