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
    // Query 1: Ranking dos Alunos
    const sqlRanking = `
        SELECT a.nome, a.ra, COUNT(e.id_livro) as total_lidos
        FROM alunos a
        LEFT JOIN emprestimos e ON a.id = e.id_aluno AND e.status = 'devolvido'
        GROUP BY a.id
        ORDER BY total_lidos DESC
    `;

    // Query 2: Contagem por Categoria
    const sqlCategorias = `
        SELECT l.categoria, COUNT(e.id) as quantidade
        FROM emprestimos e
        JOIN livros l ON e.id_livro = l.id
        WHERE e.status = 'devolvido'
        GROUP BY l.categoria
        ORDER BY quantidade DESC
    `;

    db.query(sqlRanking, (err, resultRanking) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro Ranking: ' + err.message });

        db.query(sqlCategorias, (err2, resultCategorias) => {
            if (err2) return res.status(500).json({ success: false, message: 'Erro Categorias: ' + err2.message });

            res.json({ 
                success: true, 
                ranking: resultRanking,
                categorias: resultCategorias
            });
        });
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

// Rota de Cadastro de Aluno 
app.post('/api/aluno/cadastrar', (req, res) => {
    console.log('--> Recebido pedido de cadastro:', req.body); 

    const { ra, nome, email, telefone } = req.body;

    // Validação básica
    if (!ra || !nome || !email || !telefone) {
        console.log('--> Falha: Campos em falta');
        return res.status(400).json({ success: false, message: 'Preencha todos os campos!' });
    }

    const sql = 'INSERT INTO alunos (ra, nome, email, telefone, pontuacao) VALUES (?, ?, ?, ?, 0)';
    
    db.query(sql, [ra, nome, email, telefone], (err, result) => {
        if (err) {
            console.error('--> Erro MySQL:', err.message);
            return res.status(500).json({ success: false, message: 'Erro no banco: ' + err.message });
        }
        console.log('--> Aluno cadastrado com sucesso! ID:', result.insertId);
        res.status(200).json({ success: true });
    });
});
// ==================== ROTAS TOTEM ====================

// RETIRADA
app.post('/api/totem/retirada', (req, res) => {
    let { ra, codigo_livro } = req.body; 
    
    // 1. Limpeza de segurança (remove espaços extras)
    if (!ra || !codigo_livro) return res.status(400).json({ success: false, message: "Dados incompletos" });
    ra = ra.trim();
    codigo_livro = codigo_livro.trim();

    console.log(`--> [Retirada] Tentativa: RA=${ra}, Livro='${codigo_livro}'`);

    // 2. Busca aluno
    db.query('SELECT id FROM alunos WHERE ra = ?', [ra], (err, alunos) => {
        if (err) return res.status(500).json({ success: false, message: "Erro servidor: " + err.message });
        if (!alunos || !alunos.length) return res.status(404).json({ success: false, message: 'Aluno não encontrado' });
        
        const idAluno = alunos[0].id;

        // 3. Busca livro (USANDO LIKE PARA SER MAIS FLEXÍVEL)
        // O comando LIKE ? permite achar mesmo se tiver pequenas diferenças de caso em alguns bancos
        const sqlLivro = 'SELECT id, disponivel, titulo, codigo FROM livros WHERE codigo = ? OR titulo LIKE ?';
        
        db.query(sqlLivro, [codigo_livro, codigo_livro], (err, livros) => {
            if (err) {
                console.error("Erro no SQL do Livro:", err);
                return res.status(500).json({ success: false, message: "Erro ao buscar livro" });
            }
            
            console.log("--> Livros encontrados:", livros.length); 

            if (!livros || !livros.length) {
                return res.status(404).json({ success: false, message: `Livro '${codigo_livro}' não encontrado no acervo.` });
            }
            
            // Pega o primeiro livro disponível que achar com esse nome/código
            const livro = livros.find(l => l.disponivel === 1) || livros[0];

            if (livro.disponivel === 0) {
                return res.status(400).json({ success: false, message: `O livro "${livro.titulo}" já está emprestado!` });
            }

            // 4. Registra Empréstimo
            const sqlEmp = 'INSERT INTO emprestimos (id_aluno, id_livro, data_retirada, data_devolucao, status) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), "ativo")';
            
            db.query(sqlEmp, [idAluno, livro.id], (err) => {
                if(err) {
                    console.error("Erro ao inserir empréstimo:", err);
                    return res.status(500).json({success: false, message: "Erro ao registrar: " + err.message});
                }
                
                // 5. Atualiza status do livro
                db.query('UPDATE livros SET disponivel = 0 WHERE id = ?', [livro.id], () => {
                    console.log(`--> Sucesso! Livro ${livro.titulo} retirado por Aluno ID ${idAluno}`);
                    res.status(200).json({ success: true });
                });
            });
        });
    });
});

// DEVOLUÇÃO
app.post('/api/totem/devolucao', (req, res) => {
    let { codigo_livro } = req.body;
    
    if(!codigo_livro) return res.status(400).json({success: false, message: "Digite o livro"});
    codigo_livro = codigo_livro.trim();

    console.log(`--> [Devolução] Buscando livro: '${codigo_livro}'`);

    // Busca ID do livro
    const sqlBusca = 'SELECT id, titulo FROM livros WHERE codigo = ? OR titulo LIKE ?';
    
    db.query(sqlBusca, [codigo_livro, codigo_livro], (err, livros) => {
        if (err) return res.status(500).json({ success: false, message: "Erro SQL: " + err.message });
        
        if (!livros || !livros.length) {
            console.log("--> Livro não achado no banco.");
            return res.status(404).json({ success: false, message: "Livro não encontrado no sistema" });
        }
        
        const idLivro = livros[0].id;
        
        // Tenta fechar o empréstimo
        const sqlUpdate = 'UPDATE emprestimos SET status="devolvido", data_devolucao=NOW() WHERE id_livro=? AND status="ativo"';
        db.query(sqlUpdate, [idLivro], (err, result) => {
             if(err) return res.status(500).json({success: false, message: "Erro SQL: " + err.message});
             
             if(result.affectedRows === 0) {
                 return res.status(400).json({
                     success: false, 
                     message: `O livro "${livros[0].titulo}" foi achado, mas NÃO consta como emprestado.`
                 });
             }

            // Libera o livro
            db.query('UPDATE livros SET disponivel=1 WHERE id=?', [idLivro], () => {
                console.log(`--> Sucesso! Livro ${livros[0].titulo} devolvido.`);
                res.status(200).json({ success: true });
            });
        });
    });
});

app.get('/', (req, res) => res.redirect('/aluno/Login.html'));

app.listen(PORT, () => console.log(`🚀 Server rodando na porta ${PORT}`));