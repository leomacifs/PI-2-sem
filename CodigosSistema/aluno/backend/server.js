const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rota principal - vai para página inicial do aluno
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/Página_Inicial_A.html'));
});

// Rota para teste da API
app.get('/api/teste', (req, res) => {
    res.json({ 
        success: true, 
        message: '✅ Backend funcionando!',
        data: new Date().toLocaleString('pt-BR')
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('=================================');
    console.log('SERVIDOR RODANDO!');
    console.log(`http://localhost:${PORT}`);
    console.log('=================================');
});