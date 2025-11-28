const express = require('express');
const path = require('path');
// Importa a conexão do arquivo de configuração para evitar duplicidade
const db = require('./config/database'); 

const app = express();
const PORT = 3001;

// ==================== 1. CONFIGURAÇÕES ====================
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// Serve arquivos estáticos da pasta raiz do projeto
app.use(express.static(path.join(__dirname, '../')));

// Teste de conexão (Opcional, pois o require já carrega a config)
db.connect(err => {
    if (err) console.error('❌ Erro MySQL:', err.message);
    else console.log('✅ MySQL Conectado via config!');
});

// ==================== 2. ROTAS DA API ====================

// --- BIBLIOTECÁRIO ---

// Rota movida para FORA do POST (Correção do Bug Crítico)
app.get('/api/bibliotecario/livros', (req, res) => {
    db.query('SELECT * FROM livros', (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.status(200).json({ success: true, livros: results });
    });
});

app.post('/api/bibliotecario/cadastrar-livro', (req, res) => {
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
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// --- ALUNO ---

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
    // Nota: O SQL original estava 'INSERT INTO alunos'. Verifique se a tabela é 'alunos' ou 'aluno'
    const sql = 'INSERT INTO alunos (ra, nome, email, telefone) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [ra, nome, email, telefone], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao cadastrar ou RA Duplicado' });
        res.status(200).json({ success: true });
    });
});

// --- TOTEM ---

app.post('/api/totem/retirada', (req, res) => {
    const { ra, codigo_livro } = req.body;

    db.query('SELECT id FROM alunos WHERE ra = ?', [ra], (err, alunos) => {
        if (!alunos || !alunos.length) return res.status(404).json({ success: false, message: 'Aluno não encontrado' });

        db.query('SELECT id FROM livros WHERE codigo = ? AND disponivel = 1', [codigo_livro], (err, livros) => {
            if (!livros || !livros.length) return res.status(404).json({ success: false, message: 'Livro indisponível ou inexistente' });

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

app.post('/api/totem/devolucao', (req, res) => {
    const { codigo_livro } = req.body;

    db.query('SELECT id FROM livros WHERE codigo = ?', [codigo_livro], (err, livros) => {
        if (!livros || !livros.length) return res.status(404).json({ success: false, message: "Livro não encontrado" });
        
        const idLivro = livros[0].id;
        
        const sqlUpdateEmprestimo = 'UPDATE emprestimos SET status="devolvido", data_devolucao=NOW() WHERE id_livro=? AND status="ativo"'; // Ajuste o status conforme seu banco (pode ser NULL a data de devolução ao invés de status 'ativo')
        
        db.query(sqlUpdateEmprestimo, [idLivro], (err) => {
             if(err) return res.status(500).json({success: false, message: "Erro ao devolver"});

            db.query('UPDATE livros SET disponivel=1 WHERE id=?', [idLivro], () => {
                res.status(200).json({ success: true });
            });
        });
    });
});

// ==================== 3. ROTA PADRÃO ====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../aluno/Login.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express ON em http://localhost:${PORT}`);
});