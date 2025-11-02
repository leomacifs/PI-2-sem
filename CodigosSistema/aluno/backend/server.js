const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
const app = express();

const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta frontend E da pasta backend/js
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/js', express.static(path.join(__dirname, 'js'))); // ← ADICIONAR ESTA LINHA

// Conexão MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'BreMaia13407', 
    database: 'sistema_biblioteca'
});

// Conectar ao MySQL
db.connect((err) => {
    if (err) {
        console.log('❌ Erro MySQL:', err.message);
        return;
    }
    console.log('✅ Conectado ao MySQL!');
});

// ==================== ROTAS ====================

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/Página_Inicial_A.html'));
});

// Rota status
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: '✅ Servidor funcionando!',
        mysql: db.state === 'authenticated' ? 'online' : 'offline',
        porta: PORT,
        timestamp: new Date().toLocaleString('pt-BR')
    });
});

// ROTA DE TESTE DO BANCO (ADICIONAR ESTA)
app.get('/api/teste-banco', (req, res) => {
    db.query('SELECT 1 as result', (err, results) => {
        if (err) {
            return res.json({
                success: false,
                message: '❌ Erro no banco: ' + err.message
            });
        }
        res.json({
            success: true,
            message: '✅ Banco conectado!',
            data: results
        });
    });
});

// Rota para cadastrar aluno
app.post('/api/alunos/cadastrar', (req, res) => {
    const { ra, nome, email, telefone } = req.body;

    if (!ra || !nome || !email || !telefone) {
        return res.status(400).json({
            success: false,
            message: 'Todos os campos são obrigatórios!'
        });
    }

    const sql = 'INSERT INTO aluno (ra, nome, email, telefone, pontuacao) VALUES (?, ?, ?, ?, 0)';
    
    db.query(sql, [ra, nome, email, telefone], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'RA já cadastrado!'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Erro no banco de dados: ' + err.message
            });
        }

        console.log('✅ Aluno cadastrado ID:', result.insertId);
        
        res.json({
            success: true,
            message: 'Aluno cadastrado com sucesso!',
            id: result.insertId
        });
    });
});

// Rota para listar alunos (para teste)
app.get('/api/alunos', (req, res) => {
    db.query('SELECT * FROM aluno', (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar alunos'
            });
        }
        res.json({
            success: true,
            alunos: results
        });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('=================================');
    console.log('🚀 SERVIDOR RODANDO NA PORTA 3001!');
    console.log('📚 http://localhost:3001');
    console.log('🔍 Status: http://localhost:3001/api/status');
    console.log('👥 Alunos: http://localhost:3001/api/alunos');
    console.log('=================================');
});