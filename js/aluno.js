const API_URL = 'http://localhost:3001/api';

// Função para cadastrar aluno
async function cadastrarAluno(event) {
    event.preventDefault();
    
    const ra = document.getElementById('ra').value;
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('Email').value;
    const telefone = document.getElementById('tel').value;

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
                ra: ra,
                nome: nome,
                email: email,
                telefone: telefone
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Aluno cadastrado com sucesso!');
            window.location.href = 'Cadastro_Aluno_Confirmado.html';
        } else {
            alert(`❌ Erro: ${data.message}`);
        }

    } catch (error) {
        console.error('Erro:', error);
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
        const response = await fetch(`${API_URL}/alunos/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ra: ra })
        });

        const data = await response.json();

        if (data.success) {
            // Salvar dados do aluno no localStorage
            localStorage.setItem('aluno', JSON.stringify(data.aluno));
            alert(`✅ Login realizado com sucesso!\nBem-vindo, ${data.aluno.nome}!`);
            window.location.href = 'BemVindo.html';
        } else {
            alert(`❌ Erro: ${data.message}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro de conexão com o servidor.');
    }
}

// Função para visualizar classificação
async function visualizarClassificacao() {
    try {
        const alunoData = localStorage.getItem('aluno');
        if (!alunoData) {
            alert('❌ Você precisa fazer login primeiro.');
            window.location.href = 'Login.html';
            return;
        }

        const aluno = JSON.parse(alunoData);
        const response = await fetch(`${API_URL}/alunos/classificacao/${aluno.id}`);
        const data = await response.json();

        if (data.success) {
            if (data.naFila) {
                alert(`📊 Sua posição na fila: ${data.classificacao.posicao}ª\nTotal de pessoas na fila: ${data.classificacao.totalNaFila}\nStatus: ${data.classificacao.status}`);
            } else {
                const entrar = confirm('Você não está na fila. Deseja entrar na fila agora?');
                if (entrar) {
                    entrarNaFila();
                }
            }
        } else {
            alert(`❌ Erro: ${data.message}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro de conexão com o servidor.');
    }
}

// Função para entrar na fila
async function entrarNaFila() {
    try {
        const alunoData = localStorage.getItem('aluno');
        if (!alunoData) {
            window.location.href = 'Login.html';
            return;
        }

        const aluno = JSON.parse(alunoData);
        const tipoAtendimento = prompt('Digite o tipo de atendimento desejado:');

        if (!tipoAtendimento) {
            alert('Tipo de atendimento é obrigatório.');
            return;
        }

        const response = await fetch(`${API_URL}/alunos/fila/entrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                alunoId: aluno.id,
                tipo_atendimento: tipoAtendimento
            })
        });

        const data = await response.json();

        if (data.success) {
            alert(`✅ Você entrou na fila!\nSua posição: ${data.posicao}ª`);
        } else {
            alert(`❌ Erro: ${data.message}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro de conexão com o servidor.');
    }
}

// Trocar usuário (logout)
function trocarUsuario() {
    localStorage.removeItem('aluno');
    window.location.href = 'Login.html';
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

    // Página BemVindo - mostrar nome do aluno
    if (window.location.href.includes('BemVindo.html')) {
        const alunoData = localStorage.getItem('aluno');
        if (alunoData) {
            const aluno = JSON.parse(alunoData);
            const titulo = document.querySelector('.card h2');
            if (titulo) {
                titulo.textContent = `Bem vindo(a), ${aluno.nome}!`;
            }
        } else {
            window.location.href = 'Login.html';
        }
    }

    // Configurar botões
    const btnClassificacao = document.querySelector('.btn[onclick*="Classificação"]');
    if (btnClassificacao) {
        btnClassificacao.onclick = visualizarClassificacao;
    }

    const btnTrocarUsuario = document.querySelector('.voltar[onclick*="Login"]');
    if (btnTrocarUsuario) {
        btnTrocarUsuario.onclick = trocarUsuario;
    }
});