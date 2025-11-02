const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
const app = express();

const PORT = 3001;

// IMPORTAR ROTAS 
const alunoRoutes = require('./routes/alunoRoutes');
const bibliotecarioRoutes = require('./routes/bibliotecarioRoutes');

// CONFIGURAÇÃO 
app.use(cors());
app.use(express.json());

// SERVIR ARQUIVOS ESTÁTICOS 
app.use('/aluno', express.static(path.join(__dirname, '../aluno')));
app.use('/bibliotecario', express.static(path.join(__dirname, '../bibliotecario')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// ==================== CONEXÃO BANCO DE DADOS ====================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'BreMaia13407',
    database: 'sistema_biblioteca'
});
//================================================================

db.connect((err) => {
    if (err) {
        return;
    }
});

//USAR ROTAS
app.use('/api/alunos', alunoRoutes);
app.use('/api/bibliotecario', bibliotecarioRoutes);

// ==================== ROTAS GERAIS ====================

// STATUS DO SERVIDOR
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor funcionando!',
        mysql: db.state === 'authenticated' ? 'online' : 'offline',
        timestamp: new Date().toLocaleString('pt-BR')
    });
});

// TESTE DO BANCO
app.get('/api/teste-banco', (req, res) => {
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

//ROTAS PRINCIPAIS ----------------------------------
app.get('/', (req, res) => {
    res.redirect('/aluno/Página_Inicial_A.html');
});

app.get('/admin', (req, res) => {
    res.redirect('/bibliotecario/Página_Inicial_B.html');
});

// INICIAR SERVIDOR --------------------------------------
app.listen(PORT, () => {
    console.log('=================================');
    console.log('SERVIDOR RODANDO NA PORTA 3001!');
    console.log('http://localhost:3001');
    console.log('Sistema Aluno: http://localhost:3001/aluno/Página_Inicial_A.html');
    console.log('Sistema Bibliotecário: http://localhost:3001/bibliotecario/Página_Inicial_B.html');
    console.log('API Status: http://localhost:3001/api/status');
    console.log('=================================');
});