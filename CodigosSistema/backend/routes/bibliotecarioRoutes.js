const express = require('express');
const router = express.Router();
const db = require('../config/database');

// CADASTRAR LIVRO
router.post('/cadastrar-livro', (req, res) => {
    const { titulo, autor, codigo, categoria } = req.body;

    if (!titulo || !autor || !codigo || !categoria) {
        return res.status(400).json({
            success: false,
            message: 'Todos os campos são obrigatórios!'
        });
    }

    const sql = 'INSERT INTO livro (titulo, autor, codigo, categoria, disponivel) VALUES (?, ?, ?, ?, 1)';
    
    db.query(sql, [titulo, autor, codigo, categoria], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao cadastrar livro: ' + err.message
            });
        }

        res.json({
            success: true,
            message: 'Livro cadastrado com sucesso!',
            id: result.insertId
        });
    });
});

// LISTAR LIVROS
router.get('/livros', (req, res) => {
    const sql = 'SELECT * FROM livro ORDER BY titulo';
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, livros: results });
    });
});

// BUSCAR LIVRO POR ID
router.get('/livros/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM livro WHERE id_livro = ?'; // Atenção: id_livro ou id (verifique seu banco)
    
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'Livro não encontrado.' });
        res.json({ success: true, livro: results[0] });
    });
});

// ATUALIZAR LIVRO
router.put('/livros/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, autor, codigo, categoria } = req.body;

    const sql = 'UPDATE livro SET titulo = ?, autor = ?, codigo = ?, categoria = ? WHERE id_livro = ?';
    
    db.query(sql, [titulo, autor, codigo, categoria, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'Livro atualizado com sucesso!' });
    });
});

// EXCLUIR LIVRO
router.delete('/livros/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM livro WHERE id_livro = ?'; // Use id_livro se essa for a PK
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'Livro excluído com sucesso!' });
    });
});

// DASHBOARD
router.get('/dashboard', (req, res) => {
    const queries = {
        totalLivros: 'SELECT COUNT(*) as total FROM livro',
        totalAlunos: 'SELECT COUNT(*) as total FROM aluno',
        livrosDisponiveis: 'SELECT COUNT(*) as disponiveis FROM livro WHERE disponivel = 1',
    };

    Promise.all([
        db.promise().query(queries.totalLivros),
        db.promise().query(queries.totalAlunos),
        db.promise().query(queries.livrosDisponiveis)
    ]).then(([livrosResult, alunosResult, disponiveisResult]) => {
        res.json({
            success: true,
            dashboard: {
                totalLivros: livrosResult[0][0].total,
                totalAlunos: alunosResult[0][0].total,
                livrosDisponiveis: disponiveisResult[0][0].disponiveis
            }
        });
    }).catch(err => {
        res.status(500).json({ success: false, message: 'Erro dashboard: ' + err.message });
    });

});

router.get('/relatorio-classificacao', (req, res) => {
    // Busca alunos e conta quantos empréstimos com status 'devolvido' eles têm
    const sql = `
        SELECT a.nome, a.ra, COUNT(e.id_livro) as total_lidos
        FROM aluno a
        LEFT JOIN emprestimo e ON a.id_aluno = e.id_aluno AND e.status = 'devolvido'
        GROUP BY a.id_aluno
        ORDER BY total_lidos DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro no banco: ' + err.message });
        }
        
        res.json({ success: true, ranking: results });
    });
});

module.exports = router;