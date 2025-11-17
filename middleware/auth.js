// Middleware simples para verificar se o aluno está autenticado
const verificarAluno = (req, res, next) => {
    const alunoId = req.headers['aluno-id'] || req.body.alunoId;
    
    if (!alunoId) {
        return res.status(401).json({ 
            success: false, 
            message: 'Aluno não autenticado' 
        });
    }
    
    req.alunoId = alunoId;
    next();
};

module.exports = { verificarAluno };