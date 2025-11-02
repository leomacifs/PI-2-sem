const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração da conexão com o MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'BreMaia13407',
  database: 'sistema_biblioteca'
});

// Conectar ao MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conectado ao banco de dados MySQL');
});

// Rota para a página inicial (vamos apenas servir um HTML estático se tivéssemos, mas como não temos, vamos redirecionar ou deixar para o frontend)
// Vamos criar uma rota de boas-vindas para a API
app.get('/', (req, res) => {
  res.send('Bem-vindo ao Sistema de Gestão de Biblioteca Universitária');
});

// Rota para listar livros
app.get('/api/livros', (req, res) => {
  const sql = 'SELECT * FROM livros';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Rota para cadastrar um livro
app.post('/api/livros', (req, res) => {
  const { titulo, autor, isbn, categoria } = req.body;

  // Precisamos gerar um id_Livro? Vamos supor que seja auto-incremento, mas a tabela não está configurada como auto-incremento.
  // Vamos alterar a tabela para auto-incremento? Ou gerar um id único? 
  // Como a tabela foi criada sem auto-incremento, vamos buscar o máximo id e incrementar.

  const getMaxId = 'SELECT MAX(id_Livro) as maxId FROM livros';
  db.query(getMaxId, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    let nextId = 1;
    if (results[0].maxId) {
      nextId = results[0].maxId + 1;
    }

    const sql = 'INSERT INTO livros (id_Livro, titulo, autor, ISBN, categoria) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nextId, titulo, autor, isbn, categoria], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Livro cadastrado com sucesso!', id: nextId });
    });
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});