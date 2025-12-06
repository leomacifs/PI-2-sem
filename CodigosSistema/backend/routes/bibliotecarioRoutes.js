const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Cadastrar Livro
router.post('/cadastrar-livro', (req, res) => {
    const { titulo, autor, codigo, categoria } = req.body;
    const sql = 'INSERT INTO livros (titulo, autor, codigo, categoria, disponivel) VALUES (?, ?, ?, ?, 1)';
    db.query(sql, [titulo, autor, codigo, categoria], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
    });
});

// Listar Livros
router.get('/livros', (req, res) => {
    db.query('SELECT * FROM livros ORDER BY titulo', (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, livros: results });
    });
});

// Relatório de Ranking
router.get('/relatorio-classificacao', (req, res) => {
    // Query que conta quantos livros devolvidos cada aluno tem
    const sql = `
        SELECT a.nome, a.ra, COUNT(e.id_livro) as total_lidos
        FROM alunos a
        LEFT JOIN emprestimos e ON a.id = e.id_aluno AND e.status = 'devolvido'
        GROUP BY a.id
        ORDER BY total_lidos DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, ranking: results });
    });
});

// Histórico Completo
router.get('/historico-completo', (req, res) => {
    const query = `
        SELECT 'Empréstimo' as tipo, l.titulo, a.nome, a.ra, e.data_retirada as data_evento 
        FROM emprestimos e 
        JOIN livros l ON e.id_livro = l.id 
        JOIN alunos a ON e.id_aluno = a.id
        UNION ALL
        SELECT 'Devolução' as tipo, l.titulo, a.nome, a.ra, e.data_devolucao as data_evento 
        FROM emprestimos e 
        JOIN livros l ON e.id_livro = l.id 
        JOIN alunos a ON e.id_aluno = a.id
        WHERE e.status = 'devolvido'
        ORDER BY data_evento DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar histórico' });
        res.json({ success: true, historico: results });
    });
});

module.exports = router;