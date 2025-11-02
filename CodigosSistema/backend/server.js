const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
const app = express();

const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// ==================== SERVIR FRONTENDS SEPARADOS ====================
app.use('/aluno', express.static(path.join(__dirname, '../frontend/aluno')));
app.use('/bibliotecario', express.static(path.join(__dirname, '../frontend/bibliotecario')));
app.use('/js', express.static(path.join(__dirname, 'js'))); // JavaScript compartilhado

// Conexão MySQL ÚNICA
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'BreMaia13407',
    database: 'sistema_biblioteca'
});

db.connect((err) => {
    if (err) {
        console.log('❌ Erro MySQL:', err.message);
        return;
    }
    console.log('✅ Conectado ao MySQL!');
});

// ==================== ROTAS ALUNO ====================
app.post('/api/alunos/cadastrar', (req, res) => {
    // Sua rota atual de cadastro de aluno
});

app.get('/api/alunos/login/:ra', (req, res) => {
    // Sua rota atual de login
});

// ==================== ROTAS BIBLIOTECÁRIO ====================
app.post('/api/bibliotecario/cadastrar-livro', (req, res) => {
    const { titulo, autor, isbn, categoria } = req.body;
    
    const sql = 'INSERT INTO livro (titulo, autor, isbn, categoria) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [titulo, autor, isbn, categoria], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao cadastrar livro: ' + err.message
            });
        }
        
        res.json({
            success: true,
            message: 'Livro cadastrado com sucesso!',
            id: result.insertId
        });
    });
});

app.get('/api/bibliotecario/livros', (req, res) => {
    // Listar livros para o bibliotecário
});

// ==================== ROTAS COMPARTILHADAS ====================
app.get('/api/emprestimos', (req, res) => {
    // Empréstimos (ambos os sistemas podem usar)
});

app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: '✅ Servidor funcionando!',
        timestamp: new Date().toLocaleString('pt-BR')
    });
});

// ==================== ROTAS PRINCIPAIS ====================
app.get('/', (req, res) => {
    res.redirect('/aluno'); // Redireciona para sistema do aluno
});

app.get('/admin', (req, res) => {
    res.redirect('/bibliotecario'); // Redireciona para sistema do bibliotecário
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('=================================');
    console.log('🚀 SERVIDOR ÚNICO RODANDO!');
    console.log('📚 http://localhost:3001');
    console.log('👨‍🎓 Sistema Aluno: http://localhost:3001/aluno');
    console.log('👨‍💼 Sistema Bibliotecário: http://localhost:3001/bibliotecario');
    console.log('=================================');
});