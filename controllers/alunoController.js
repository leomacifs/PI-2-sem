const db = require('../config/database');

const alunoController = {
    // Cadastrar aluno
    cadastrar: (req, res) => {
        const { ra, nome, email, telefone } = req.body;

        if (!ra || !nome || !email || !telefone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Todos os campos são obrigatórios.' 
            });
        }

        const sql = `INSERT INTO alunos (ra, nome, email, telefone, data_cadastro) VALUES (?, ?, ?, ?, NOW())`;
        
        db.execute(sql, [ra, nome, email, telefone], (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        success: false,
                        message: 'RA já cadastrado no sistema.'
                    });
                }
                console.error('Erro ao cadastrar aluno:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor.'
                });
            }

            res.json({
                success: true,
                message: 'Aluno cadastrado com sucesso!',
                alunoId: results.insertId
            });
        });
    },

    // Login do aluno
    login: (req, res) => {
        const { ra } = req.body;

        if (!ra) {
            return res.status(400).json({
                success: false,
                message: 'RA é obrigatório.'
            });
        }

        const sql = `SELECT id, ra, nome, email FROM alunos WHERE ra = ?`;
        
        db.execute(sql, [ra], (err, results) => {
            if (err) {
                console.error('Erro no login:', err);
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
    },

    // Buscar classificação na fila
    getClassificacao: (req, res) => {
        const { alunoId } = req.params;

        const sql = `
            SELECT 
                f.id,
                f.posicao,
                f.data_entrada,
                f.status,
                (SELECT COUNT(*) FROM fila WHERE status = 'aguardando') as total_na_fila
            FROM fila f
            WHERE f.aluno_id = ? AND f.status IN ('aguardando', 'em_atendimento')
            ORDER BY f.data_entrada DESC
            LIMIT 1
        `;
        
        db.execute(sql, [alunoId], (err, results) => {
            if (err) {
                console.error('Erro ao buscar classificação:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor.'
                });
            }

            if (results.length === 0) {
                return res.json({
                    success: true,
                    message: 'Aluno não está na fila',
                    naFila: false
                });
            }

            const posicao = results[0];
            
            res.json({
                success: true,
                naFila: true,
                classificacao: {
                    posicao: posicao.posicao,
                    totalNaFila: posicao.total_na_fila,
                    dataEntrada: posicao.data_entrada,
                    status: posicao.status
                }
            });
        });
    },

    // Entrar na fila
    entrarNaFila: (req, res) => {
        const { alunoId, tipo_atendimento } = req.body;

        if (!alunoId || !tipo_atendimento) {
            return res.status(400).json({
                success: false,
                message: 'Dados incompletos.'
            });
        }

        // Verificar se já está na fila
        const checkSql = `SELECT id FROM fila WHERE aluno_id = ? AND status IN ('aguardando', 'em_atendimento')`;
        
        db.execute(checkSql, [alunoId], (err, results) => {
            if (err) {
                console.error('Erro ao verificar fila:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor.'
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Você já está na fila'
                });
            }

            // Buscar última posição
            const posicaoSql = `SELECT MAX(posicao) as ultima FROM fila WHERE status = 'aguardando'`;
            
            db.execute(posicaoSql, (err, posResults) => {
                if (err) {
                    console.error('Erro ao buscar posição:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro interno do servidor.'
                    });
                }

                const novaPosicao = (posResults[0].ultima || 0) + 1;

                // Inserir na fila
                const insertSql = `INSERT INTO fila (aluno_id, posicao, tipo_atendimento, data_entrada, status) VALUES (?, ?, ?, NOW(), 'aguardando')`;
                
                db.execute(insertSql, [alunoId, novaPosicao, tipo_atendimento], (err, insertResults) => {
                    if (err) {
                        console.error('Erro ao entrar na fila:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Erro interno do servidor.'
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Você entrou na fila!',
                        posicao: novaPosicao
                    });
                });
            });
        });
    }
};

module.exports = alunoController;