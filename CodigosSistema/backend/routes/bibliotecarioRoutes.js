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

    // CORREÇÃO: Tabela 'livros' (plural)
    const sql = 'INSERT INTO livros (titulo, autor, codigo, categoria, disponivel) VALUES (?, ?, ?, ?, 1)';
    
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
    // CORREÇÃO: Tabela 'livros' (plural)
    const sql = 'SELECT * FROM livros ORDER BY titulo';
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, livros: results });
    });
});

// BUSCAR LIVRO POR ID
router.get('/livros/:id', (req, res) => {
    const { id } = req.params;
    // CORREÇÃO: Tabela 'livros' e coluna 'id'
    const sql = 'SELECT * FROM livros WHERE id = ?'; 
    
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

    // CORREÇÃO: Tabela 'livros' e coluna 'id'
    const sql = 'UPDATE livros SET titulo = ?, autor = ?, codigo = ?, categoria = ? WHERE id = ?';
    
    db.query(sql, [titulo, autor, codigo, categoria, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'Livro atualizado com sucesso!' });
    });
});

// EXCLUIR LIVRO
router.delete('/livros/:id', (req, res) => {
    const { id } = req.params;
    // CORREÇÃO: Tabela 'livros' e coluna 'id'
    const sql = 'DELETE FROM livros WHERE id = ?'; 
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'Livro excluído com sucesso!' });
    });
});

// DASHBOARD
router.get('/dashboard', (req, res) => {
    
    // CORREÇÃO: Tabela 'livros'
    db.query('SELECT COUNT(*) as total FROM livros', (err, resultLivros) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        // CORREÇÃO: Tabela 'alunos'
        db.query('SELECT COUNT(*) as total FROM alunos', (err, resultAlunos) => {
            if (err) return res.status(500).json({ success: false, message: err.message });

            // CORREÇÃO: Tabela 'livros'
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

router.get('/relatorio-classificacao', (req, res) => {
    // CORREÇÃO GERAL: Tabelas no plural e junção correta dos IDs
    // a.id é o ID do aluno na tabela 'alunos'
    // e.id_aluno é a chave estrangeira na tabela 'emprestimos'
    const sql = `
        SELECT a.nome, a.ra, COUNT(e.id_livro) as total_lidos
        FROM alunos a
        LEFT JOIN emprestimos e ON a.id = e.id_aluno AND e.status = 'devolvido'
        GROUP BY a.id
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