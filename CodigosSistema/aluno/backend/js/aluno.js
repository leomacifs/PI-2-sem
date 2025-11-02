// Sistema de Biblioteca - Aluno
console.log('✅ Sistema de Biblioteca carregado!');

const API_URL = 'http://localhost:3001/api';

// Função para cadastrar aluno NO BANCO
async function cadastrarAluno(event) {
    event.preventDefault();
    
    const ra = document.getElementById('ra').value;
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('Email').value;
    const telefone = document.getElementById('tel').value;

    // Validação
    if (!ra || !nome || !email || !telefone) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    console.log('📤 Enviando dados para o servidor...', { ra, nome, email, telefone });

    try {
        // Fazer requisição para o backend
        const response = await fetch(`${API_URL}/alunos/cadastrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ra: parseInt(ra),
                nome: nome,
                email: email,
                telefone: telefone
            })
        });

        const data = await response.json();
        console.log('📥 Resposta do servidor:', data);

        if (data.success) {
            alert('✅ Aluno cadastrado com sucesso no banco de dados!');
            window.location.href = 'Cadastro_Aluno_Confirmado.html';
        } else {
            alert(`❌ Erro: ${data.message}`);
        }

    } catch (error) {
        console.error('❌ Erro de conexão:', error);
        alert('❌ Erro de conexão com o servidor. Verifique se o backend está rodando.');
    }
}

// Função para login
function loginAluno(event) {
    event.preventDefault();
    
    const ra = document.querySelector('input[name="ra"]').value;

    if (!ra) {
        alert('Por favor, digite seu RA.');
        return;
    }

    alert(`Login realizado!\nRA: ${ra}`);
}

// Testar conexão com banco
async function testarConexaoBanco() {
    try {
        const response = await fetch(`${API_URL}/teste-banco`);
        const data = await response.json();
        console.log('🔍 Teste banco:', data);
    } catch (error) {
        console.log('❌ Backend não está respondendo');
    }
}

// Configurar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Página carregada:', window.location.pathname);
    
    // Testar conexão quando a página inicial carregar
    if (window.location.href.includes('Página_Inicial_A.html')) {
        testarConexaoBanco();
    }
    
    // Cadastro
    const formCadastro = document.querySelector('form');
    if (formCadastro && window.location.href.includes('Cadastrar.html')) {
        formCadastro.addEventListener('submit', cadastrarAluno);
    }
    
    // Login
    const formLogin = document.querySelector('form');
    if (formLogin && window.location.href.includes('Login.html')) {
        formLogin.addEventListener('submit', loginAluno);
    }
});