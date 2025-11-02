const express = require('express');
const router = express.Router();
const db = require('../config/database');

// CADASTRAR LIVRO ------------------------------
router.post('/cadastrar-livro', (req, res) => {
    const { titulo, autor, isbn, categoria } = req.body;

    if (!titulo || !autor || !isbn || !categoria) {
        return res.status(400).json({
            success: false,
            message: 'Todos os campos são obrigatórios!'
        });
    }

    const sql = 'INSERT INTO livro (titulo, autor, isbn, categoria) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [titulo, autor, isbn, categoria], (err, result) => {
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

// ==================== LISTAR LIVROS ====================
router.get('/livros', (req, res) => {
    const sql = 'SELECT * FROM livro ORDER BY titulo';
    
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar livros: ' + err.message
            });
        }

        res.json({
            success: true,
            livros: results
        });
    });
});

// ==================== BUSCAR LIVRO POR ID ====================
router.get('/livros/:id', (req, res) => {
    const { id } = req.params;
    
    const sql = 'SELECT * FROM livro WHERE id = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar livro: ' + err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Livro não encontrado.'
            });
        }

        res.json({
            success: true,
            livro: results[0]
        });
    });
});

// ==================== ATUALIZAR LIVRO ====================
router.put('/livros/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, autor, isbn, categoria } = req.body;

    if (!titulo || !autor || !isbn || !categoria) {
        return res.status(400).json({
            success: false,
            message: 'Todos os campos são obrigatórios!'
        });
    }

    const sql = 'UPDATE livro SET titulo = ?, autor = ?, isbn = ?, categoria = ? WHERE id = ?';
    
    db.query(sql, [titulo, autor, isbn, categoria, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao atualizar livro: ' + err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Livro não encontrado.'
            });
        }

        res.json({
            success: true,
            message: 'Livro atualizado com sucesso!'
        });
    });
});

// ==================== EXCLUIR LIVRO ====================
router.delete('/livros/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM livro WHERE id = ?';
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao excluir livro: ' + err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Livro não encontrado.'
            });
        }

        res.json({
            success: true,
            message: 'Livro excluído com sucesso!'
        });
    });
});

// ==================== DASHBOARD BIBLIOTECÁRIO ====================
router.get('/dashboard', (req, res) => {
    const queries = {
        totalLivros: 'SELECT COUNT(*) as total FROM livro',
        totalAlunos: 'SELECT COUNT(*) as total FROM aluno',
        livrosDisponiveis: 'SELECT COUNT(*) as disponiveis FROM livro WHERE disponivel = true',
        // Adicione mais estatísticas conforme necessário
    };

    // Executar todas as queries em paralelo
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
        res.status(500).json({
            success: false,
            message: 'Erro ao carregar dashboard'
        });
    });
});

module.exports = router;