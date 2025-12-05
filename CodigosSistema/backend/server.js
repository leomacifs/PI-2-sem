require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./config/database');
const cors = require('cors'); // npm install cors

// Importando rotas do bibliotecário
const bibliotecarioRoutes = require('./routes/bibliotecarioRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// ==================== CONFIGURAÇÕES ====================
app.use(express.json());
app.use(cors());

// ==================== ARQUIVOS ESTÁTICOS (FRONTEND) ====================
app.use('/aluno', express.static(path.join(__dirname, '../aluno')));
app.use('/Bibliotecario', express.static(path.join(__dirname, '../Bibliotecario')));
app.use('/totem', express.static(path.join(__dirname, '../totem')));

// ==================== BANCO DE DADOS ====================
db.connect(err => {
    if (err) console.error('❌ Erro MySQL:', err.message);
    else console.log('✅ MySQL Conectado com sucesso!');
});

// ==================== ROTAS DA API ====================

// 1. Rota do Bibliotecário
app.use('/api/bibliotecario', bibliotecarioRoutes);

// 2. Rotas ALUNO
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
    
    // O ID é gerado automaticamente pelo banco (AUTO_INCREMENT).
    // Nós apenas inserimos os dados do aluno.
    const sql = 'INSERT INTO alunos (ra, nome, email, telefone, pontuacao) VALUES (?, ?, ?, ?, 0)';
    
    db.query(sql, [ra, nome, email, telefone], (err) => {
        if (err) {
            // Tratamento para evitar duplicidade de RA
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Este RA já está cadastrado.' });
            }
            return res.status(500).json({ success: false, message: 'Erro ao cadastrar: ' + err.message });
        }
        res.status(200).json({ success: true });
    });
});

// 3. Rotas TOTEM
app.post('/api/totem/retirada', (req, res) => {
    let { ra, codigo_livro } = req.body; 
    
    if (!ra || !codigo_livro) return res.status(400).json({ success: false, message: "Dados incompletos" });
    ra = ra.trim();
    codigo_livro = codigo_livro.trim();

    // Busca ID do aluno pelo RA
    db.query('SELECT id FROM alunos WHERE ra = ?', [ra], (err, alunos) => {
        if (err) return res.status(500).json({ success: false, message: "Erro servidor: " + err.message });
        if (!alunos || !alunos.length) return res.status(404).json({ success: false, message: 'Aluno não encontrado' });
        
        const idAluno = alunos[0].id;

        // Busca livro
        const sqlLivro = 'SELECT id, disponivel, titulo, codigo FROM livros WHERE codigo = ? OR titulo LIKE ?';
        db.query(sqlLivro, [codigo_livro, codigo_livro], (err, livros) => {
            if (err) return res.status(500).json({ success: false, message: "Erro ao buscar livro" });
            
            if (!livros || !livros.length) {
                return res.status(404).json({ success: false, message: `Livro '${codigo_livro}' não encontrado.` });
            }
            
            const livro = livros.find(l => l.disponivel === 1) || livros[0];

            if (livro.disponivel === 0) {
                return res.status(400).json({ success: false, message: `O livro "${livro.titulo}" já está emprestado!` });
            }

            // Registra Empréstimo usando o idAluno (interno) e idLivro (interno)
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
    let { codigo_livro } = req.body;
    if(!codigo_livro) return res.status(400).json({success: false, message: "Digite o livro"});
    codigo_livro = codigo_livro.trim();

    // Busca ID do livro
    const sqlBusca = 'SELECT id, titulo FROM livros WHERE codigo = ? OR titulo LIKE ?';
    db.query(sqlBusca, [codigo_livro, codigo_livro], (err, livros) => {
        if (err) return res.status(500).json({ success: false, message: "Erro SQL: " + err.message });
        if (!livros || !livros.length) return res.status(404).json({ success: false, message: "Livro não encontrado" });
        
        const idLivro = livros[0].id;
        
        // Finaliza empréstimo
        const sqlUpdate = 'UPDATE emprestimos SET status="devolvido", data_devolucao=NOW() WHERE id_livro=? AND status="ativo"';
        db.query(sqlUpdate, [idLivro], (err, result) => {
             if(err) return res.status(500).json({success: false, message: "Erro SQL: " + err.message});
             
             if(result.affectedRows === 0) {
                 return res.status(400).json({
                     success: false, 
                     message: `O livro "${livros[0].titulo}" não consta como emprestado.`
                 });
             }

            // Libera o livro
            db.query('UPDATE livros SET disponivel=1 WHERE id=?', [idLivro], () => {
                res.status(200).json({ success: true });
            });
        });
    });
});

// ==================== ROTA INICIAL ====================
app.get('/', (req, res) => {
    res.redirect('/aluno/Login.html');
});

// Inicia Servidor
app.listen(PORT, () => console.log(`🚀 Server rodando na porta ${PORT}`));