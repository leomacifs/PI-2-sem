const express = require('express');
const router = express.Router();
const db = require('../config/database');

// CADASTRAR ALUNO
router.post('/cadastrar', (req, res) => {
    const { ra, nome, email, telefone } = req.body;

    // Validar campos obrigatórios
    if (!ra || !nome || !email || !telefone) {
        return res.status(400).json({ 
            success: false, 
            message: 'Todos os campos são obrigatórios.' 
        });
    }

    // Inserir no banco (pontuação inicia em 0)
    const sql = `INSERT INTO aluno (ra, nome, email, telefone, pontuação) VALUES (?, ?, ?, ?, 0)`;
    
    db.execute(sql, [ra, nome, email, telefone], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'RA já cadastrado no sistema.'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor.'
            });
        }

        res.json({
            success: true,
            message: 'Aluno cadastrado com sucesso!',
            aluno: { ra, nome, email, telefone }
        });
    });
});

// LOGIN DO ALUNO (buscar por RA)
router.get('/login/:ra', (req, res) => {
    const { ra } = req.params;

    const sql = `SELECT * FROM aluno WHERE ra = ?`;
    
    db.execute(sql, [ra], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor.'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aluno não encontrado. Verifique o RA.'
            });
        }

        res.json({
            success: true,
            message: 'Login realizado com sucesso!',
            aluno: results[0]
        });
    });
});

// BUSCAR ALUNO POR RA
router.get('/:ra', (req, res) => {
    const { ra } = req.params;

    const sql = `SELECT * FROM aluno WHERE ra = ?`;
    
    db.execute(sql, [ra], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor.'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aluno não encontrado.'
            });
        }

        res.json({
            success: true,
            aluno: results[0]
        });
    });
});

module.exports = router;