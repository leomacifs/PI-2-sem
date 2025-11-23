const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const PORT = 3001;

// ==================== 1. CONEXÃO COM O BANCO DE DADOS ====================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'BreMaia13407', 
    database: 'biblioteca_db'
});

db.connect(err => {
    if (err) {
        console.error('❌ Erro ao conectar no MySQL:', err.message);
    } else {
        console.log('✅ Conectado ao MySQL (biblioteca_db)!');
    }
});

// ==================== 2. FUNÇÕES AUXILIARES ====================
const getBody = (req) => {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try { resolve(body ? JSON.parse(body) : {}); } catch (e) { resolve({}); }
        });
    });
};

const sendJSON = (res, status, data) => {
    res.writeHead(status, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
    });
    res.end(JSON.stringify(data));
};

// ==================== 3. SERVIDOR HTTP ====================
const server = http.createServer(async (req, res) => {
    
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    try {
        // ==================== API BIBLIOTECÁRIO ====================
        
        // Cadastrar Livro
        if (req.url === '/api/bibliotecario/cadastrar-livro' && req.method === 'POST') {
            const body = await getBody(req);
            // Validação
            if (!body.titulo || !body.autor || !body.codigo || !body.categoria) {
                return sendJSON(res, 400, { success: false, message: 'Preencha todos os campos!' });
            }
            
            db.query('INSERT INTO livros (titulo, autor, codigo, categoria, disponivel) VALUES (?, ?, ?, ?, 1)', 
                [body.titulo, body.autor, body.codigo, body.categoria], 
                (err) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') return sendJSON(res, 400, { success: false, message: 'Código do livro já existe!' });
                        return sendJSON(res, 500, { success: false, message: err.message });
                    }
                    sendJSON(res, 200, { success: true, message: 'Livro cadastrado!' });
                }
            );
            return;
        }

        // ==================== API ALUNO ====================

        // Cadastro de Aluno
        if (req.url === '/api/aluno/cadastrar' && req.method === 'POST') {
            const body = await getBody(req);
            if (!body.ra || !body.nome) return sendJSON(res, 400, { success: false, message: 'RA e Nome são obrigatórios' });

            db.query('INSERT INTO alunos (ra, nome, email, telefone) VALUES (?, ?, ?, ?)', 
                [body.ra, body.nome, body.email, body.telefone], 
                (err) => {
                    if (err) return sendJSON(res, 500, { success: false, message: 'Erro ou RA já existe.' });
                    sendJSON(res, 200, { success: true, message: 'Aluno cadastrado!' });
                }
            );
            return;
        }

        // Login de Aluno
        if (req.url === '/api/aluno/login' && req.method === 'POST') {
            const body = await getBody(req);
            db.query('SELECT * FROM alunos WHERE ra = ?', [body.ra], (err, results) => {
                if (err) return sendJSON(res, 500, { success: false, message: err.message });
                if (results.length === 0) return sendJSON(res, 404, { success: false, message: 'Aluno não encontrado.' });
                sendJSON(res, 200, { success: true, aluno: results[0] });
            });
            return;
        }

        // ==================== API TOTEM (Retirada/Devolução) ====================

        // Retirada de Livro
        if (req.url === '/api/totem/retirada' && req.method === 'POST') {
            const body = await getBody(req); // Espera { ra: '...', codigo_livro: '...' }
            
            // 1. Achar Aluno
            db.query('SELECT id, nome FROM alunos WHERE ra = ?', [body.ra], (err, alunos) => {
                if (alunos.length === 0) return sendJSON(res, 404, { success: false, message: 'RA não encontrado' });
                
                const aluno = alunos[0];

                // 2. Achar Livro DISPONÍVEL pelo código
                db.query('SELECT id, titulo FROM livros WHERE codigo = ? AND disponivel = 1', [body.codigo_livro], (err, livros) => {
                    if (livros.length === 0) return sendJSON(res, 404, { success: false, message: 'Livro não encontrado ou indisponível.' });
                    
                    const livro = livros[0];

                    // 3. Registrar Empréstimo
                    db.query('INSERT INTO emprestimos (id_aluno, id_livro) VALUES (?, ?)', [aluno.id, livro.id], (err) => {
                        if (err) return sendJSON(res, 500, { success: false, message: 'Erro ao registrar empréstimo' });
                        
                        // 4. Atualizar livro para indisponível
                        db.query('UPDATE livros SET disponivel = 0 WHERE id = ?', [livro.id], () => {
                            sendJSON(res, 200, { success: true, message: `Retirada de "${livro.titulo}" confirmada para ${aluno.nome}!` });
                        });
                    });
                });
            });
            return;
        }

        // Devolução de Livro
        if (req.url === '/api/totem/devolucao' && req.method === 'POST') {
            const body = await getBody(req); // Espera { codigo_livro: '...' }

            // 1. Achar o livro pelo código
            db.query('SELECT id, titulo FROM livros WHERE codigo = ?', [body.codigo_livro], (err, livros) => {
                if (livros.length === 0) return sendJSON(res, 404, { success: false, message: 'Livro não encontrado.' });
                
                const livro = livros[0];

                // 2. Atualizar o empréstimo para devolvido (adiciona data de devolução)
                db.query('UPDATE emprestimos SET status = "devolvido", data_devolucao = NOW() WHERE id_livro = ? AND status = "ativo"', [livro.id], (err, result) => {
                    
                    // 3. Tornar o livro disponível novamente
                    db.query('UPDATE livros SET disponivel = 1 WHERE id = ?', [livro.id], () => {
                        sendJSON(res, 200, { success: true, message: `Devolução de "${livro.titulo}" realizada com sucesso!` });
                    });
                });
            });
            return;
        }

        // ==================== SERVIDOR DE ARQUIVOS ESTÁTICOS ====================
        let filePath = '.' + req.url;
        
        // Ajustes de rota para facilitar
        if (filePath === './') filePath = '../aluno/Login.html'; // Tela inicial padrão
        
        // Se pedir arquivo da pasta /js/, aponta para a pasta backend/js local
        if (req.url.startsWith('/js/')) {
            filePath = path.join(__dirname, req.url); 
        } else {
            // Para HTML/CSS/Imagens, sobe um nível para a raiz do projeto
            filePath = path.join(__dirname, '../', req.url);
        }

        const extname = path.extname(filePath);
        let contentType = 'text/html';
        switch (extname) {
            case '.js': contentType = 'text/javascript'; break;
            case '.css': contentType = 'text/css'; break;
            case '.json': contentType = 'application/json'; break;
            case '.png': contentType = 'image/png'; break;
            case '.jpg': contentType = 'image/jpg'; break;
        }

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if(error.code == 'ENOENT') {
                    res.writeHead(404); res.end(`Arquivo não encontrado: ${req.url}`);
                } else {
                    res.writeHead(500); res.end(`Erro servidor: ${error.code}`);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });

    } catch (error) {
        sendJSON(res, 500, { success: false, message: 'Erro Crítico no Servidor' });
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando: http://localhost:${PORT}`);
    console.log(`   -> Aluno: http://localhost:${PORT}/aluno/Login.html`);
    console.log(`   -> Bibliotecário: http://localhost:${PORT}/Bibliotecario/1 - Pagina_Inicial/Pagina_inicial.html`);
    console.log(`   -> Totem: http://localhost:${PORT}/totem/Página_Inicial_T.html`);
});