require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./config/database');
const bibliotecarioRoutes = require('./routes/bibliotecarioRoutes'); 

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

// Teste BD
db.connect(err => {
    if (err) console.error('❌ Erro MySQL:', err.message);
    else console.log('✅ MySQL Conectado!');
});

// ==================== ROTAS ====================

// Rotas modulares do Bibliotecário
app.use('/api/bibliotecario', bibliotecarioRoutes);

// ALUNO
app.post('/api/aluno/login', (req, res) => {
    const { ra } = req.body;
    db.query('SELECT * FROM aluno WHERE ra = ?', [ra], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'RA não encontrado' });
        res.status(200).json({ success: true, aluno: results[0] });
    });
});

app.post('/api/aluno/cadastrar', (req, res) => {
    const { ra, nome, email, telefone } = req.body;
    const sql = 'INSERT INTO aluno (ra, nome, email, telefone, pontuacao) VALUES (?, ?, ?, ?, 0)';
    db.query(sql, [ra, nome, email, telefone], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro/RA Duplicado' });
        res.status(200).json({ success: true });
    });
});

// TOTEM (Retirada/Devolução usando CODIGO)
app.post('/api/totem/retirada', (req, res) => {
    const { ra, codigo_livro } = req.body; 

    // 1. Acha aluno
    db.query('SELECT id_aluno FROM aluno WHERE ra = ?', [ra], (err, alunos) => {
        if (err) return res.status(500).json({ success: false, message: "Erro servidor" });
        if (!alunos || !alunos.length) return res.status(404).json({ success: false, message: 'Aluno não encontrado' });
        
        const idAluno = alunos[0].id_aluno;

        // 2. Acha livro e VERIFICA DISPONIBILIDADE
        const sqlLivro = 'SELECT id_livro, disponivel FROM livro WHERE codigo = ?';
        db.query(sqlLivro, [codigo_livro], (err, livros) => {
            if (err) return res.status(500).json({ success: false, message: "Erro ao buscar livro" });
            if (!livros || !livros.length) return res.status(404).json({ success: false, message: 'Livro não encontrado' });
            
            const livro = livros[0];

            // Validação extra de segurança
            if (livro.disponivel === 0) {
                return res.status(400).json({ success: false, message: 'Livro já está emprestado!' });
            }

            // 3. Cria Empréstimo
            const sqlEmp = 'INSERT INTO emprestimo (id_aluno, id_livro, data_retirada, data_devolucao_prevista, status) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), "ativo")';
            
            db.query(sqlEmp, [idAluno, livro.id_livro], (err) => {
                if(err) {
                    console.error(err);
                    return res.status(500).json({success: false, message: "Erro ao registrar empréstimo"});
                }
                
                // 4. SÓ AGORA marca como indisponível
                db.query('UPDATE livro SET disponivel = 0 WHERE id_livro = ?', [livro.id_livro], (errUpdate) => {
                    if (errUpdate) {
                        console.error("ERRO CRÍTICO: Empréstimo criado mas livro não atualizado", errUpdate);
                    }
                    res.status(200).json({ success: true });
                });
            });
        });
    });
});

app.post('/api/totem/devolucao', (req, res) => {
    const { codigo_livro } = req.body;

    // 1. Busca ID pelo código
    db.query('SELECT id_livro FROM livro WHERE codigo = ?', [codigo_livro], (err, livros) => {
        if (!livros || !livros.length) return res.status(404).json({ success: false, message: "Livro não encontrado" });
        const idLivro = livros[0].id_livro;
        
        // 2. Fecha empréstimo
        const sqlUpdate = 'UPDATE emprestimo SET status="devolvido", data_devolucao_real=NOW() WHERE id_livro=? AND status="ativo"';
        db.query(sqlUpdate, [idLivro], (err, result) => {
             if(err) return res.status(500).json({success: false, message: "Erro SQL"});
             if(result.affectedRows === 0) return res.status(400).json({success: false, message: "Livro não estava emprestado"});

            // 3. Libera livro
            db.query('UPDATE livro SET disponivel=1 WHERE id_livro=?', [idLivro], () => {
                res.status(200).json({ success: true });
            });
        });
    });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../aluno/Login.html')));

app.listen(PORT, () => console.log(`🚀 Server rodando na porta ${PORT}`));