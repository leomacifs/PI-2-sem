const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');
const { verificarAluno } = require('../middleware/auth');

// Rotas públicas
router.post('/cadastrar', alunoController.cadastrar);
router.post('/login', alunoController.login);

// Rotas protegidas (requer autenticação)
router.get('/classificacao/:alunoId', alunoController.getClassificacao);
router.post('/fila/entrar', alunoController.entrarNaFila);

module.exports = router;