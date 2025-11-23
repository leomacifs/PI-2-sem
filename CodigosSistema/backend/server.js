const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const PORT = 3001;

// ==================== 1. CONEXÃO COM O BANCO ====================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'BreMaia13407', // <--- CONFIRA A SENHA
    database: 'biblioteca_db'
});

db.connect(err => {
    if (err) console.error('❌ Erro MySQL:', err.message);
    else console.log('✅ MySQL Conectado!');
});

// ==================== 2. FUNÇÕES AUXILIARES ====================
const getBody = (req) => new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
        try { resolve(body ? JSON.parse(body) : {}); } catch (e) { resolve({}); }
    });
});

const sendJSON = (res, status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(data));
};

// ==================== 3. SERVIDOR HTTP ====================
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    // Log simples para ver o que está chegando
    if (!req.url.includes('favicon')) console.log(`📥 [${req.method}] ${req.url}`);

    try {
        // --- API: BIBLIOTECÁRIO ---
        if (req.url === '/api/bibliotecario/cadastrar-livro' && req.method === 'POST') {
            const body = await getBody(req);
            if (!body.titulo || !body.autor || !body.codigo || !body.categoria) {
                return sendJSON(res, 400, { success: false, message: 'Campos vazios.' });
            }
            db.query('INSERT INTO livros (titulo, autor, codigo, categoria, disponivel) VALUES (?, ?, ?, ?, 1)', 
                [body.titulo, body.autor, body.codigo, body.categoria], (err) => {
                if (err) return sendJSON(res, 500, { success: false, message: err.message });
                sendJSON(res, 200, { success: true });
            });
            return;
        }

        // --- API: ALUNO (Login) ---
        if (req.url === '/api/aluno/login' && req.method === 'POST') {
            const body = await getBody(req);
            db.query('SELECT * FROM alunos WHERE ra = ?', [body.ra], (err, results) => {
                if (err) return sendJSON(res, 500, { success: false, message: err.message });
                if (results.length === 0) return sendJSON(res, 404, { success: false, message: 'RA não encontrado' });
                sendJSON(res, 200, { success: true, aluno: results[0] });
            });
            return;
        }

        // --- API: ALUNO (Cadastro) ---
        if (req.url === '/api/aluno/cadastrar' && req.method === 'POST') {
            const body = await getBody(req);
            db.query('INSERT INTO alunos (ra, nome, email, telefone) VALUES (?, ?, ?, ?)', 
                [body.ra, body.nome, body.email, body.telefone], (err) => {
                if (err) return sendJSON(res, 500, { success: false, message: 'Erro/RA Duplicado' });
                sendJSON(res, 200, { success: true });
            });
            return;
        }

        // --- API: TOTEM (Retirada) ---
        if (req.url === '/api/totem/retirada' && req.method === 'POST') {
            const body = await getBody(req);
            db.query('SELECT id FROM alunos WHERE ra = ?', [body.ra], (err, alunos) => {
                if (!alunos.length) return sendJSON(res, 404, { success: false, message: 'Aluno não achado' });
                db.query('SELECT id FROM livros WHERE codigo = ? AND disponivel = 1', [body.codigo_livro], (err, livros) => {
                    if (!livros.length) return sendJSON(res, 404, { success: false, message: 'Livro indisponível' });
                    db.query('INSERT INTO emprestimos (id_aluno, id_livro) VALUES (?, ?)', [alunos[0].id, livros[0].id], () => {
                        db.query('UPDATE livros SET disponivel = 0 WHERE id = ?', [livros[0].id], () => {
                            sendJSON(res, 200, { success: true });
                        });
                    });
                });
            });
            return;
        }

        // --- API: TOTEM (Devolução) ---
        if (req.url === '/api/totem/devolucao' && req.method === 'POST') {
            const body = await getBody(req);
            db.query('SELECT id FROM livros WHERE codigo = ?', [body.codigo_livro], (err, livros) => {
                if (!livros.length) return sendJSON(res, 404, { success: false });
                const idLivro = livros[0].id;
                db.query('UPDATE emprestimos SET status="devolvido", data_devolucao=NOW() WHERE id_livro=? AND status="ativo"', [idLivro], () => {
                    db.query('UPDATE livros SET disponivel=1 WHERE id=?', [idLivro], () => {
                        sendJSON(res, 200, { success: true });
                    });
                });
            });
            return;
        }

        // ==================== 4. SERVIDOR DE ARQUIVOS (CORREÇÃO ROBUSTA) ====================
        
        // 1. Decodifica URL (transforma %20 em espaço)
        let safeUrl = decodeURI(req.url.split('?')[0]);
        
        // 2. Remove a barra inicial para o path.join funcionar direito
        if (safeUrl.startsWith('/')) safeUrl = safeUrl.slice(1);
        
        // 3. Define o caminho base
        let filePath;
        if (safeUrl === '' || safeUrl === 'index.html') {
            // Se não pediu nada, manda pro Login
            filePath = path.join(__dirname, '../aluno/Login.html');
        } else if (safeUrl.startsWith('js/') || safeUrl.startsWith('js\\')) {
            // Se for JS da pasta backend
            filePath = path.join(__dirname, safeUrl);
        } else {
            // Se for qualquer outra coisa (HTML, CSS, IMG), busca na raiz do projeto (../)
            filePath = path.join(__dirname, '../', safeUrl);
        }

        const extname = path.extname(filePath).toLowerCase();
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
                    // Log de erro amigável para sabermos ONDE ele tentou procurar
                    console.log(`❌ 404: Arquivo não encontrado no caminho:\n   -> ${filePath}`);
                    res.writeHead(404); res.end(`Erro 404: Arquivo nao encontrado: ${safeUrl}`);
                } else {
                    res.writeHead(500); res.end(`Erro servidor: ${error.code}`);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });

    } catch (error) {
        console.error(error);
        sendJSON(res, 500, { success: false, message: 'Erro interno' });
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor ON em http://localhost:${PORT}`);
    console.log('Use Ctrl+C para parar.');
});