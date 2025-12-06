// ==================== IMPORTAÇÕES ====================
require('dotenv').config(); // Lê o arquivo .env
const express = require('express');
const path = require('path');
const db = require('./config/database'); // Importa a conexão com o banco
const cors = require('cors'); // Permite comunicação entre front e back

// Importa as rotas separadas do bibliotecário para organizar o código
const bibliotecarioRoutes = require('./routes/bibliotecarioRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// ==================== CONFIGURAÇÕES DO SERVIDOR ====================
app.use(express.json()); // Habilita o servidor a ler JSON (dados enviados pelos formulários)
app.use(cors()); // Libera acesso de diferentes origens

// ==================== FRONTEND ====================
// Estas linhas liberam as pastas para serem acessadas pelo navegador

app.use('/aluno', express.static(path.join(__dirname, '../aluno')));
app.use('/Bibliotecario', express.static(path.join(__dirname, '../Bibliotecario')));
app.use('/totem', express.static(path.join(__dirname, '../totem')));

//Libera a pasta backend para o HTML achar os scripts .js 
app.use('/backend', express.static(path.join(__dirname, '../backend')));

// ==================== CONEXÃO COM O BANCO DE DADOS ====================
db.connect(err => {
    if (err) console.error('❌ Erro ao conectar no MySQL:', err.message);
    else console.log('✅ MySQL Conectado com sucesso!');
});

// ==================== ROTAS DA API====================

// 1. ROTAS DO BIBLIOTECÁRIO (Modularizadas)
app.use('/api/bibliotecario', bibliotecarioRoutes);

// 2. ROTAS DO ALUNO
// Rota de Login
app.post('/api/aluno/login', (req, res) => {
    const { ra } = req.body;
    // Busca o aluno no banco pelo RA
    db.query('SELECT * FROM alunos WHERE ra = ?', [ra], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'RA não encontrado' });
        // Retorna os dados do aluno se encontrado
        res.status(200).json({ success: true, aluno: results[0] });
    });
});

// Rota de Cadastro
app.post('/api/aluno/cadastrar', (req, res) => {
    const { ra, nome, email, telefone } = req.body;
    const sql = 'INSERT INTO alunos (ra, nome, email, telefone, pontuacao) VALUES (?, ?, ?, ?, 0)';
    
    db.query(sql, [ra, nome, email, telefone], (err) => {
        if (err) {
            // Código de erro para RA duplicado no banco
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Este RA já está cadastrado.' });
            }
            return res.status(500).json({ success: false, message: 'Erro ao cadastrar: ' + err.message });
        }
        res.status(200).json({ success: true });
    });
});

// 3. ROTAS DO TOTEM (Retirada e Devolução)

// Rota de Retirada
app.post('/api/totem/retirada', (req, res) => {
    let { ra, codigo_livro } = req.body; 
    
    // Validação básica
    if (!ra || !codigo_livro) return res.status(400).json({ success: false, message: "Dados incompletos" });
    ra = ra.trim();
    codigo_livro = codigo_livro.trim();

    // Passo 1: Busca o ID do aluno usando o RA
    db.query('SELECT id FROM alunos WHERE ra = ?', [ra], (err, alunos) => {
        if (err) return res.status(500).json({ success: false, message: "Erro servidor: " + err.message });
        if (!alunos || !alunos.length) return res.status(404).json({ success: false, message: 'Aluno não encontrado' });
        
        const idAluno = alunos[0].id;

        // Passo 2: Busca o livro pelo Código OU Título
        const sqlLivro = 'SELECT id, disponivel, titulo, codigo FROM livros WHERE codigo = ? OR titulo LIKE ?';
        db.query(sqlLivro, [codigo_livro, codigo_livro], (err, livros) => {
            if (err) return res.status(500).json({ success: false, message: "Erro ao buscar livro" });
            
            if (!livros || !livros.length) {
                return res.status(404).json({ success: false, message: `Livro '${codigo_livro}' não encontrado.` });
            }
            
            const livro = livros[0]; // Pega o primeiro encontrado

            if (livro.disponivel === 0) {
                return res.status(400).json({ success: false, message: `O livro "${livro.titulo}" já está emprestado!` });
            }

            // Passo 3: Registra o empréstimo na tabela 'emprestimos'
            const sqlEmp = 'INSERT INTO emprestimos (id_aluno, id_livro, data_retirada, data_devolucao, status) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), "ativo")';
            db.query(sqlEmp, [idAluno, livro.id], (err) => {
                if(err) return res.status(500).json({success: false, message: "Erro ao registrar: " + err.message});
                
                // Passo 4: Atualiza o livro para Indisponível (0)
                db.query('UPDATE livros SET disponivel = 0 WHERE id = ?', [livro.id], () => {
                    res.status(200).json({ success: true });
                });
            });
        });
    });
});

// Rota de Devolução
app.post('/api/totem/devolucao', (req, res) => {
    let { codigo_livro } = req.body;
    if(!codigo_livro) return res.status(400).json({success: false, message: "Digite o livro"});
    codigo_livro = codigo_livro.trim();

    // Passo 1: Busca o ID do livro
    const sqlBusca = 'SELECT id, titulo FROM livros WHERE codigo = ? OR titulo LIKE ?';
    db.query(sqlBusca, [codigo_livro, codigo_livro], (err, livros) => {
        if (err) return res.status(500).json({ success: false, message: "Erro SQL: " + err.message });
        if (!livros || !livros.length) return res.status(404).json({ success: false, message: "Livro não encontrado" });
        
        const idLivro = livros[0].id;
        
        // Passo 2: Atualiza o empréstimo para 'devolvido'
        const sqlUpdate = 'UPDATE emprestimos SET status="devolvido", data_devolucao=NOW() WHERE id_livro=? AND status="ativo"';
        db.query(sqlUpdate, [idLivro], (err, result) => {
             if(err) return res.status(500).json({success: false, message: "Erro SQL: " + err.message});
             
             if(result.affectedRows === 0) {
                 return res.status(400).json({
                     success: false, 
                     message: `O livro "${livros[0].titulo}" não consta como emprestado.`
                 });
             }

            // Passo 3: Libera o livro (disponivel = 1)
            db.query('UPDATE livros SET disponivel=1 WHERE id=?', [idLivro], () => {
                res.status(200).json({ success: true });
            });
        });
    });
});

// ==================== ROTA RAIZ ====================
app.get('/', (req, res) => {
    res.redirect('/aluno/Login.html'); // Redireciona para o login do aluno
});

// ==================== INICIALIZAÇÃO ====================
app.listen(PORT, () => console.log(`🚀 Server rodando na porta ${PORT}`));