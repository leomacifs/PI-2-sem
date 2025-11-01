import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureDataFiles, readJson, writeJson } from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Servir arquivos estáticos do frontend (HTML, CSS, JS)
const frontendPath = path.join(__dirname, '..', '..');
app.use(express.static(frontendPath));

app.use(cors({ origin: true }));
app.use(express.json());

await ensureDataFiles();

// Utilidades
function getNowBr() {
  return new Date().toLocaleString('pt-BR');
}

// Rotas de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// === Alunos ===
app.post('/api/alunos', async (req, res) => {
  const { nome, identificador, email, curso } = req.body || {};
  if (!nome || !identificador || !email || !curso) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome, identificador, email, curso' });
  }

  const db = await readJson('alunos.json');
  const exists = db.alunos.find(a => a.identificador === identificador);
  if (exists) {
    return res.status(409).json({ error: 'Aluno já cadastrado' });
  }

  const aluno = { nome, identificador, email, curso, createdAt: getNowBr() };
  db.alunos.push(aluno);
  await writeJson('alunos.json', db);
  res.status(201).json(aluno);
});

app.get('/api/alunos/:identificador/pontuacao', async (req, res) => {
  const { identificador } = req.params;
  const alunosDb = await readJson('alunos.json');
  const aluno = alunosDb.alunos.find(a => a.identificador === identificador);
  if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });

  const histDb = await readJson('emprestimos.json');
  const emprestimosAluno = histDb.historico.filter(h => h.identificador === identificador && h.tipo === 'Empréstimo');
  const devolucoesAluno = histDb.historico.filter(h => h.identificador === identificador && h.tipo === 'Devolução');
  const livrosLidos = Math.max(0, devolucoesAluno.length); // conta devoluções como lidos

  let classificacao = 'Leitor Iniciante';
  let classe = 'iniciante';
  if (livrosLidos > 20) { classificacao = 'Leitor Extremo'; classe = 'extremo'; }
  else if (livrosLidos > 10) { classificacao = 'Leitor Ativo'; classe = 'ativo'; }
  else if (livrosLidos > 5) { classificacao = 'Leitor Regular'; classe = 'regular'; }

  res.json({ aluno, livrosLidos, classificacao, classe });
});

// === Livros ===
app.post('/api/livros', async (req, res) => {
  const { titulo, autor, isbn, editora, ano, categoria } = req.body || {};
  if (!titulo || !autor || !isbn || !editora || !ano || !categoria) {
    return res.status(400).json({ error: 'Campos obrigatórios: titulo, autor, isbn, editora, ano, categoria' });
  }
  const db = await readJson('livros.json');
  const exists = db.livros.find(l => l.isbn === isbn);
  if (exists) return res.status(409).json({ error: 'Livro já cadastrado' });
  const livro = { titulo, autor, isbn, editora, ano, categoria, disponivel: true, createdAt: getNowBr() };
  db.livros.push(livro);
  await writeJson('livros.json', db);
  res.status(201).json(livro);
});

app.get('/api/livros', async (req, res) => {
  const { search, somenteDisponiveis } = req.query;
  const db = await readJson('livros.json');
  let result = db.livros;
  if (search) {
    const s = String(search).toLowerCase();
    result = result.filter(l =>
      l.titulo.toLowerCase().includes(s) ||
      l.autor.toLowerCase().includes(s) ||
      l.isbn.includes(search)
    );
  }
  if (String(somenteDisponiveis) === 'true') {
    result = result.filter(l => l.disponivel);
  }
  res.json(result);
});

app.get('/api/livros/emprestados', async (req, res) => {
  const db = await readJson('livros.json');
  res.json(db.livros.filter(l => !l.disponivel));
});

// === Empréstimos / Devoluções ===
app.post('/api/emprestimos', async (req, res) => {
  const { identificador, isbn } = req.body || {};
  if (!identificador || !isbn) return res.status(400).json({ error: 'identificador e isbn são obrigatórios' });

  const alunosDb = await readJson('alunos.json');
  const aluno = alunosDb.alunos.find(a => a.identificador === identificador);
  if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });

  const livrosDb = await readJson('livros.json');
  const livro = livrosDb.livros.find(l => l.isbn === isbn);
  if (!livro) return res.status(404).json({ error: 'Livro não encontrado' });
  if (!livro.disponivel) return res.status(409).json({ error: 'Livro já emprestado' });

  livro.disponivel = false;
  await writeJson('livros.json', livrosDb);

  const histDb = await readJson('emprestimos.json');
  histDb.historico.push({ tipo: 'Empréstimo', identificador, isbn, livro: livro.titulo, dataHora: getNowBr() });
  await writeJson('emprestimos.json', histDb);

  res.status(201).json({ message: 'Empréstimo registrado', identificador, isbn });
});

app.post('/api/devolucoes', async (req, res) => {
  const { identificador, isbn } = req.body || {};
  if (!identificador || !isbn) return res.status(400).json({ error: 'identificador e isbn são obrigatórios' });

  const livrosDb = await readJson('livros.json');
  const livro = livrosDb.livros.find(l => l.isbn === isbn);
  if (!livro) return res.status(404).json({ error: 'Livro não encontrado' });
  if (livro.disponivel) return res.status(409).json({ error: 'Livro já está disponível' });

  livro.disponivel = true;
  await writeJson('livros.json', livrosDb);

  const histDb = await readJson('emprestimos.json');
  histDb.historico.push({ tipo: 'Devolução', identificador, isbn, livro: livro.titulo, dataHora: getNowBr() });
  await writeJson('emprestimos.json', histDb);

  res.status(201).json({ message: 'Devolução registrada', identificador, isbn });
});

app.get('/api/historico', async (req, res) => {
  const histDb = await readJson('emprestimos.json');
  res.json(histDb.historico);
});

// === Relatórios ===
app.get('/api/relatorios/classificacao-geral', async (req, res) => {
  const alunosDb = await readJson('alunos.json');
  const histDb = await readJson('emprestimos.json');
  const devolucoesPorAluno = new Map();
  for (const h of histDb.historico) {
    if (h.tipo !== 'Devolução') continue;
    devolucoesPorAluno.set(h.identificador, (devolucoesPorAluno.get(h.identificador) || 0) + 1);
  }
  const alunos = alunosDb.alunos.map(a => {
    const livrosLidos = devolucoesPorAluno.get(a.identificador) || 0;
    let classificacao = 'iniciante';
    if (livrosLidos > 20) classificacao = 'extremo';
    else if (livrosLidos > 10) classificacao = 'ativo';
    else if (livrosLidos > 5) classificacao = 'regular';
    return { nome: a.nome, identificador: a.identificador, livrosLidos, classificacao };
  }).sort((x, y) => y.livrosLidos - x.livrosLidos);
  res.json(alunos);
});

app.get('/api/relatorios/classificacao-categoria', async (req, res) => {
  const alunosDb = await readJson('alunos.json');
  const histDb = await readJson('emprestimos.json');
  const devolucoesPorAluno = new Map();
  for (const h of histDb.historico) {
    if (h.tipo !== 'Devolução') continue;
    devolucoesPorAluno.set(h.identificador, (devolucoesPorAluno.get(h.identificador) || 0) + 1);
  }
  const totais = { iniciante: 0, regular: 0, ativo: 0, extremo: 0 };
  for (const a of alunosDb.alunos) {
    const livrosLidos = devolucoesPorAluno.get(a.identificador) || 0;
    if (livrosLidos > 20) totais.extremo++; else if (livrosLidos > 10) totais.ativo++; else if (livrosLidos > 5) totais.regular++; else totais.iniciante++;
  }
  const total = alunosDb.alunos.length || 1;
  const porcent = n => `${Math.round((n / total) * 100)}%`;
  res.json([
    { classificacao: 'Leitor Iniciante', descricao: 'até 5 livros lidos no semestre', quantidade: totais.iniciante, percentual: porcent(totais.iniciante) },
    { classificacao: 'Leitor Regular', descricao: '6 a 10 livros', quantidade: totais.regular, percentual: porcent(totais.regular) },
    { classificacao: 'Leitor Ativo', descricao: '11 a 20 livros', quantidade: totais.ativo, percentual: porcent(totais.ativo) },
    { classificacao: 'Leitor Extremo', descricao: 'mais de 20 livros', quantidade: totais.extremo, percentual: porcent(totais.extremo) }
  ]);
});

// Rota raiz - redireciona para index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Acesse http://localhost:${PORT} para ver o frontend`);
});


