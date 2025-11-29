require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./config/database');

const app = express();
const PORT = 3001;

// ==================== CONFIGURAÇÕES ====================
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});
app.use(express.static(path.join(__dirname, '../')));

// Teste de Conexão com o Banco
db.connect(err => {
    if (err) console.error('❌ Erro MySQL:', err.message);
    else console.log('✅ MySQL Conectado com sucesso!');
});

// ==================== ROTAS BIBLIOTECÁRIO (INTEGRADAS) ====================

// 1. Histórico Completo
app.get('/api/bibliotecario/historico-completo', (req, res) => {
    const query = `
        SELECT 'Empréstimo' as tipo, l.titulo, a.nome, a.ra, e.data_retirada as data_evento 
        FROM emprestimos e 
        JOIN livros l ON e.id_livro = l.id 
        JOIN alunos a ON e.id_aluno = a.id
        WHERE e.data_retirada >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        UNION ALL
        SELECT 'Devolução' as tipo, l.titulo, a.nome, a.ra, e.data_devolucao as data_evento 
        FROM emprestimos e 
        JOIN livros l ON e.id_livro = l.id 
        JOIN alunos a ON e.id_aluno = a.id
        WHERE e.status = 'devolvido' AND e.data_devolucao >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        ORDER BY data_evento DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, historico: results });
    });
});

// 2. Dashboard
app.get('/api/bibliotecario/dashboard', (req, res) => {
    db.query('SELECT COUNT(*) as total FROM livros', (err, resultLivros) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        db.query('SELECT COUNT(*) as total FROM alunos', (err, resultAlunos) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            db.query('SELECT COUNT(*) as disponiveis FROM livros WHERE disponivel = 1', (err, resultDisp) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.json({
                    success: true,
                    dashboard: {
                        totalLivros: resultLivros[0].total,
                        totalAlunos: resultAlunos[0].total,
                        livrosDisponiveis: resultDisp[0].disponiveis
                    }
                });
            });
        });
    });
});

// 3. Cadastrar Livro
app.post('/api/bibliotecario/cadastrar-livro', (req, res) => {
    const { titulo, autor, codigo, categoria } = req.body;
    if (!titulo || !autor || !codigo || !categoria) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios!' });
    }
    const sql = 'INSERT INTO livros (titulo, autor, codigo, categoria, disponivel) VALUES (?, ?, ?, ?, 1)';
    db.query(sql, [titulo, autor, codigo, categoria], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao cadastrar: ' + err.message });
        res.json({ success: true, message: 'Livro cadastrado!', id: result.insertId });
    });
});

// 4. Listar Livros
app.get('/api/bibliotecario/livros', (req, res) => {
    db.query('SELECT * FROM livros ORDER BY titulo', (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, livros: results });
    });
});

// 5. Relatório Classificação
app.get('/api/bibliotecario/relatorio-classificacao', (req, res) => {
    const sql = `
        SELECT a.nome, a.ra, COUNT(e.id_livro) as total_lidos
        FROM alunos a
        LEFT JOIN emprestimos e ON a.id = e.id_aluno AND e.status = 'devolvido'
        GROUP BY a.id
        ORDER BY total_lidos DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro no banco: ' + err.message });
        res.json({ success: true, ranking: results });
    });
});

// ==================== ROTAS ALUNO ====================
app.post('/api/aluno/login', (req, res) => {
    const { ra } = req.body;
    db.query('SELECT * FROM alunos WHERE ra = ?', [ra], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'RA não encontrado' });
        res.status(200).json({ success: true, aluno: results[0] });
    });
});

app.post('/api/aluno/cadastrar', (req, res) => {
    const { ra, nome, email, telefone } = req.body;
    const sql = 'INSERT INTO alunos (ra, nome, email, telefone, pontuacao) VALUES (?, ?, ?, ?, 0)';
    db.query(sql, [ra, nome, email, telefone], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.status(200).json({ success: true });
    });
});

// ==================== ROTAS TOTEM ====================
app.post('/api/totem/retirada', (req, res) => {
    const { ra, codigo_livro } = req.body; 
    db.query('SELECT id FROM alunos WHERE ra = ?', [ra], (err, alunos) => {
        if (err) return res.status(500).json({ success: false, message: "Erro servidor: " + err.message });
        if (!alunos || !alunos.length) return res.status(404).json({ success: false, message: 'Aluno não encontrado' });
        const idAluno = alunos[0].id;

        const sqlLivro = 'SELECT id, disponivel FROM livros WHERE codigo = ?';
        db.query(sqlLivro, [codigo_livro], (err, livros) => {
            if (err) return res.status(500).json({ success: false, message: "Erro: " + err.message });
            if (!livros || !livros.length) return res.status(404).json({ success: false, message: 'Livro não encontrado' });
            const livro = livros[0];

            if (livro.disponivel === 0) return res.status(400).json({ success: false, message: 'Livro já emprestado!' });

            const sqlEmp = 'INSERT INTO emprestimos (id_aluno, id_livro, data_retirada, data_devolucao, status) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), "ativo")';
            db.query(sqlEmp, [idAluno, livro.id], (err) => {
                if(err) return res.status(500).json({success: false, message: "Erro ao registrar: " + err.message});
                db.query('UPDATE livros SET disponivel = 0 WHERE id = ?', [livro.id], () => {
                    res.status(200).json({ success: true });
                });
            });
        });
    });
});

app.post('/api/totem/devolucao', (req, res) => {
    const { codigo_livro } = req.body;
    db.query('SELECT id FROM livros WHERE codigo = ?', [codigo_livro], (err, livros) => {
        if (!livros || !livros.length) return res.status(404).json({ success: false, message: "Livro não encontrado" });
        const idLivro = livros[0].id;
        
        const sqlUpdate = 'UPDATE emprestimos SET status="devolvido", data_devolucao=NOW() WHERE id_livro=? AND status="ativo"';
        db.query(sqlUpdate, [idLivro], (err, result) => {
             if(err) return res.status(500).json({success: false, message: "Erro SQL: " + err.message});
             if(result.affectedRows === 0) return res.status(400).json({success: false, message: "Livro não estava emprestado"});

            db.query('UPDATE livros SET disponivel=1 WHERE id=?', [idLivro], () => {
                res.status(200).json({ success: true });
            });
        });
    });
});

app.get('/', (req, res) => res.redirect('/aluno/Login.html'));

app.listen(PORT, () => console.log(`🚀 Server rodando na porta ${PORT}`));