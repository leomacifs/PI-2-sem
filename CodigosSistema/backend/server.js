const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const PORT = 3001;

// ==================== 1. CONFIGURAÇÕES DO EXPRESS ====================

// Configura o Body-Parser para ler JSON enviado no corpo da requisição
app.use(express.json());

// Configura o CORS manualmente (Permitir acesso de qualquer origem)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// Serve arquivos estáticos (HTML, CSS, JS, Imagens)
// Isso substitui toda aquela lógica complexa de "Servidor de Arquivos" do código antigo.
// Estamos apontando para a pasta "pai" (../) para ele achar as pastas 'aluno', 'css', etc.
app.use(express.static(path.join(__dirname, '../')));

// ==================== 2. CONEXÃO COM O BANCO ====================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'BreMaia13407', // <--- Mantenha sua senha segura!
    database: 'biblioteca_db'
});

db.connect(err => {
    if (err) console.error('❌ Erro MySQL:', err.message);
    else console.log('✅ MySQL Conectado!');
});

// ==================== 3. ROTAS DA API ====================

// --- API: BIBLIOTECÁRIO ---
app.post('/api/bibliotecario/cadastrar-livro', (req, res) => {
    // Com body-parser, usamos req.body direto, sem promessas
    console.log(req.body)
    try {
         const { titulo, autor, codigo, categoria } = req.body; 

    if (!titulo || !autor || !codigo || !categoria) {
        return res.status(400).json({ success: false, message: 'Campos vazios.' });
    }

    const sql = 'INSERT INTO livros (titulo, autor, codigo, categoria, disponivel) VALUES (?, ?, ?, ?, 1)';
    db.query(sql, [titulo, autor, codigo, categoria], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.status(200).json({ success: true });
    });
    }catch (error) {
        console.log('Erro ao cadastrar livro:', error);
        console.log(req.body)
        return res.status(500).json({ success: false, message: err.message });
    }
});

// --- API: ALUNO (Login) ---
app.post('/api/aluno/login', (req, res) => {
    const { ra } = req.body;
    db.query('SELECT * FROM alunos WHERE ra = ?', [ra], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'RA não encontrado' });
        
        res.status(200).json({ success: true, aluno: results[0] });
    });
});

// --- API: ALUNO (Cadastro) ---
app.post('/api/aluno/cadastrar', (req, res) => {
    const { ra, nome, email, telefone } = req.body;
    const sql = 'INSERT INTO alunos (ra, nome, email, telefone) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [ra, nome, email, telefone], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro/RA Duplicado' });
        res.status(200).json({ success: true });
    });
});

// --- API: TOTEM (Retirada) ---
app.post('/api/totem/retirada', (req, res) => {
    const { ra, codigo_livro } = req.body;

    // Lógica aninhada mantida (Callback Hell), idealmente usaríamos Promises/Async Await no futuro
    db.query('SELECT id FROM alunos WHERE ra = ?', [ra], (err, alunos) => {
        if (!alunos || !alunos.length) return res.status(404).json({ success: false, message: 'Aluno não achado' });

        db.query('SELECT id FROM livros WHERE codigo = ? AND disponivel = 1', [codigo_livro], (err, livros) => {
            if (!livros || !livros.length) return res.status(404).json({ success: false, message: 'Livro indisponível ou não existe' });

            const idAluno = alunos[0].id;
            const idLivro = livros[0].id;

            db.query('INSERT INTO emprestimos (id_aluno, id_livro) VALUES (?, ?)', [idAluno, idLivro], (err) => {
                if(err) return res.status(500).json({success: false, message: "Erro ao registrar empréstimo"});
                
                db.query('UPDATE livros SET disponivel = 0 WHERE id = ?', [idLivro], () => {
                    res.status(200).json({ success: true });
                });
            });
        });
    });
});

// --- API: TOTEM (Devolução) ---
app.post('/api/totem/devolucao', (req, res) => {
    const { codigo_livro } = req.body;

    db.query('SELECT id FROM livros WHERE codigo = ?', [codigo_livro], (err, livros) => {
        if (!livros || !livros.length) return res.status(404).json({ success: false, message: "Livro não encontrado" });
        
        const idLivro = livros[0].id;
        
        const sqlUpdateEmprestimo = 'UPDATE emprestimos SET status="devolvido", data_devolucao=NOW() WHERE id_livro=? AND status="ativo"';
        db.query(sqlUpdateEmprestimo, [idLivro], () => {
            db.query('UPDATE livros SET disponivel=1 WHERE id=?', [idLivro], () => {
                res.status(200).json({ success: true });
            });
        });
    });
});

// ==================== 4. ROTA PADRÃO (FRONTEND) ====================

// Se o usuário acessar http://localhost:3001/, mandamos ele para o Login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../aluno/Login.html'));
});

// ==================== 5. INICIAR SERVIDOR ====================
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express ON em http://localhost:${PORT}`);
});