// URL base da API
const API_BASE_URL = 'http://localhost:3001/api';

// ==================== CADASTRO DE ALUNO ====================
async function cadastrarAluno() {
    const ra = document.getElementById('ra').value;
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('Email').value;
    const telefone = document.getElementById('tel').value;

    // Validação básica
    if (!ra || !nome || !email || !telefone) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/alunos/cadastrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ra, nome, email, telefone })
        });

        const data = await response.json();

        if (data.success) {
            // Redireciona para página de confirmação
            window.location.href = 'Cadastro_Aluno_Confirmado.html';
        } else {
            alert('Erro: ' + data.message);
        }
    } catch (error) {
        alert('Erro de conexão com o servidor. Verifique se o backend está rodando.');
        console.error('Erro:', error);
    }
}

// ==================== LOGIN DO ALUNO ====================
async function loginAluno() {
    const ra = document.querySelector('input[name="ra"]').value;

    if (!ra) {
        alert('Por favor, digite seu RA.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/alunos/login/${ra}`);
        const data = await response.json();

        if (data.success) {
            alert(`Bem-vindo, ${data.aluno.nome}!`);
            // Aqui você pode redirecionar para a área do aluno
            // window.location.href = 'area-aluno.html';
        } else {
            alert('Erro: ' + data.message);
        }
    } catch (error) {
        alert('Erro de conexão com o servidor. Verifique se o backend está rodando.');
        console.error('Erro:', error);
    }
}

// ==================== EVENT LISTENERS ====================

// Cadastro - Quando o formulário for enviado
document.addEventListener('DOMContentLoaded', function() {
    const formCadastro = document.querySelector('form');
    if (formCadastro && window.location.href.includes('Cadastrar.html')) {
        formCadastro.addEventListener('submit', function(e) {
            e.preventDefault();
            cadastrarAluno();
        });
    }

    // Login - Quando o formulário for enviado
    const formLogin = document.querySelector('form');
    if (formLogin && window.location.href.includes('Login.html')) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            loginAluno();
        });
    }
});