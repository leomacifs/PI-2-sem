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
app.use(express.static(path.join(__dirname, '../'))); // (Se não mudou a pasta public, mantenha assim)

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
    // CORREÇÃO: Tabela 'alunos' (plural)
    db.query('SELECT * FROM alunos WHERE ra = ?', [ra], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'RA não encontrado' });
        res.status(200).json({ success: true, aluno: results[0] });
    });
});

app.post('/api/aluno/cadastrar', (req, res) => {
    const { ra, nome, email, telefone } = req.body;
    // CORREÇÃO: Tabela 'alunos' (plural)
    const sql = 'INSERT INTO alunos (ra, nome, email, telefone, pontuacao) VALUES (?, ?, ?, ?, 0)';
    db.query(sql, [ra, nome, email, telefone], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.status(200).json({ success: true });
    });
});

// TOTEM (Retirada/Devolução usando CODIGO)
app.post('/api/totem/retirada', (req, res) => {
    const { ra, codigo_livro } = req.body; 

    // 1. Acha aluno
    // CORREÇÃO: Tabela 'alunos' e seleciona o 'id' correto
    db.query('SELECT id FROM alunos WHERE ra = ?', [ra], (err, alunos) => {
        if (err) return res.status(500).json({ success: false, message: "Erro servidor: " + err.message });
        if (!alunos || !alunos.length) return res.status(404).json({ success: false, message: 'Aluno não encontrado' });
        
        // CORREÇÃO: O ID que vem do banco chama-se 'id', não 'id_aluno'
        const idAluno = alunos[0].id;

        // 2. Acha livro e VERIFICA DISPONIBILIDADE
        // CORREÇÃO: Tabela 'livros' e seleciona 'id'
        const sqlLivro = 'SELECT id, disponivel FROM livros WHERE codigo = ?';
        db.query(sqlLivro, [codigo_livro], (err, livros) => {
            if (err) return res.status(500).json({ success: false, message: "Erro ao buscar livro: " + err.message });
            if (!livros || !livros.length) return res.status(404).json({ success: false, message: 'Livro não encontrado' });
            
            const livro = livros[0];

            // Validação extra de segurança
            if (livro.disponivel === 0) {
                return res.status(400).json({ success: false, message: 'Livro já está emprestado!' });
            }

            // 3. Cria Empréstimo
            // CORREÇÃO: Tabela 'emprestimos' (plural)
            // Nota: Aqui usamos idAluno e livro.id (que são os IDs corretos das tabelas pais)
            const sqlEmp = 'INSERT INTO emprestimos (id_aluno, id_livro, data_retirada, data_devolucao, status) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), "ativo")';
            
            db.query(sqlEmp, [idAluno, livro.id], (err) => {
                if(err) {
                    console.error(err);
                    return res.status(500).json({success: false, message: "Erro ao registrar empréstimo: " + err.message});
                }
                
                // 4. SÓ AGORA marca como indisponível
                // CORREÇÃO: Tabela 'livros' e WHERE id = ?
                db.query('UPDATE livros SET disponivel = 0 WHERE id = ?', [livro.id], (errUpdate) => {
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
    // CORREÇÃO: Tabela 'livros' e seleciona 'id'
    db.query('SELECT id FROM livros WHERE codigo = ?', [codigo_livro], (err, livros) => {
        if (!livros || !livros.length) return res.status(404).json({ success: false, message: "Livro não encontrado" });
        
        // CORREÇÃO: ID correto
        const idLivro = livros[0].id;
        
        // 2. Fecha empréstimo
        // CORREÇÃO: Tabela 'emprestimos'
        const sqlUpdate = 'UPDATE emprestimos SET status="devolvido", data_devolucao=NOW() WHERE id_livro=? AND status="ativo"';
        db.query(sqlUpdate, [idLivro], (err, result) => {
             if(err) return res.status(500).json({success: false, message: "Erro SQL: " + err.message});
             if(result.affectedRows === 0) return res.status(400).json({success: false, message: "Livro não estava emprestado"});

            // 3. Libera livro
            // CORREÇÃO: Tabela 'livros' e WHERE id = ?
            db.query('UPDATE livros SET disponivel=1 WHERE id=?', [idLivro], () => {
                res.status(200).json({ success: true });
            });
        });
    });
});

// Redirecionamento inicial
app.get('/', (req, res) => res.redirect('/aluno/Login.html'));

app.listen(PORT, () => console.log(`🚀 Server rodando na porta ${PORT}`));