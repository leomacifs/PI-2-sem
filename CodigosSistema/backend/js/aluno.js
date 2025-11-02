const API_URL = 'http://localhost:3001/api';

// Função para cadastrar aluno no banco
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

    try {
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

        if (data.success) {
            alert('✅ Aluno cadastrado com sucesso no banco de dados!');
            window.location.href = 'Cadastro_Aluno_Confirmado.html';
        } else {
            alert(`❌ Erro: ${data.message}`);
        }

    } catch (error) {
        alert('❌ Erro de conexão com o servidor.');
    }
}

// Função para login
async function loginAluno(event) {
    event.preventDefault();
    
    const ra = document.querySelector('input[name="ra"]').value;

    if (!ra) {
        alert('Por favor, digite seu RA.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/alunos/login/${ra}`);
        const data = await response.json();

        if (data.success) {
            alert(`✅ Login realizado com sucesso!\nBem-vindo, ${data.aluno.nome}!`);
        } else {
            alert(`❌ Erro: ${data.message}`);
        }
    } catch (error) {
        alert('❌ Erro de conexão com o servidor.');
    }
}

// Configurar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
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