const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'BreMaia13407',
  database: 'sistema_biblioteca'
});

// Rota para cadastrar livros
app.post('/livros', (req, res) => {
  const { titulo, autor, isbn, categoria } = req.body;
  const sql = `INSERT INTO livros (titulo, autor, ISBN, categoria) VALUES (?, ?, ?, ?)`;
  
  db.query(sql, [titulo, autor, isbn, categoria], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: "Livro cadastrado com sucesso!", id: result.insertId });
  });
});

// Rota para listar livros (Gerenciamento)
app.get('/livros', (req, res) => {
  db.query('SELECT * FROM livros', (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// Rota para relatórios por categoria
app.get('/relatorios/categorias', (req, res) => {
  const sql = `SELECT categoria, COUNT(*) as total FROM livros GROUP BY categoria`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));