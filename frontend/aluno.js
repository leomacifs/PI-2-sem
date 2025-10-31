// URL base da API
const API_BASE_URL = 'http://localhost:3001/api';

// Elementos do DOM
const mainMenu = document.getElementById('mainMenu');
const formCadastro = document.getElementById('formCadastro');
const formConsultaLivros = document.getElementById('formConsultaLivros');
const formPontuacao = document.getElementById('formPontuacao');

const btnCadastro = document.getElementById('btnCadastro');
const btnConsultaLivros = document.getElementById('btnConsultaLivros');
const btnPontuacao = document.getElementById('btnPontuacao');

const voltarCadastro = document.getElementById('voltarCadastro');
const voltarConsultaLivros = document.getElementById('voltarConsultaLivros');
const voltarPontuacao = document.getElementById('voltarPontuacao');

const confirmarCadastro = document.getElementById('confirmarCadastro');
const btnBuscar = document.getElementById('btnBuscar');
const btnVerPontuacao = document.getElementById('btnVerPontuacao');

const messageCadastro = document.getElementById('messageCadastro');
const messagePontuacao = document.getElementById('messagePontuacao');

const resultsConsultaLivros = document.getElementById('resultsConsultaLivros');
const pontuacaoInfo = document.getElementById('pontuacaoInfo');

// Funções para navegação
function showMainMenu() {
    mainMenu.style.display = 'flex';
    formCadastro.style.display = 'none';
    formConsultaLivros.style.display = 'none';
    formPontuacao.style.display = 'none';
    clearMessages();
    clearResults();
}

function showCadastroForm() {
    mainMenu.style.display = 'none';
    formCadastro.style.display = 'block';
    formConsultaLivros.style.display = 'none';
    formPontuacao.style.display = 'none';
    clearMessages();
    clearResults();
}

function showConsultaLivrosForm() {
    mainMenu.style.display = 'none';
    formCadastro.style.display = 'none';
    formConsultaLivros.style.display = 'block';
    formPontuacao.style.display = 'none';
    clearMessages();
    clearResults();
}

function showPontuacaoForm() {
    mainMenu.style.display = 'none';
    formCadastro.style.display = 'none';
    formConsultaLivros.style.display = 'none';
    formPontuacao.style.display = 'block';
    clearMessages();
    clearResults();
}

function clearMessages() {
    messageCadastro.style.display = 'none';
    messagePontuacao.style.display = 'none';
}

function clearResults() {
    resultsConsultaLivros.innerHTML = '';
    pontuacaoInfo.style.display = 'none';
}

function showMessage(element, message, isSuccess) {
    element.textContent = message;
    element.className = isSuccess ? 'message success' : 'message error';
    element.style.display = 'block';
}

// Função para cadastro de aluno
async function processarCadastro() {
    const nome = document.getElementById('nome').value;
    const identificador = document.getElementById('identificador').value;
    const email = document.getElementById('email').value;
    const curso = document.getElementById('curso').value;

    if (!nome || !identificador || !email || !curso) {
        showMessage(messageCadastro, 'Por favor, preencha todos os campos.', false);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/alunos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, identificador, email, curso })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(messageCadastro, data.error || 'Erro ao cadastrar aluno.', false);
            return;
        }

        showMessage(
            messageCadastro,
            `Cadastro realizado com sucesso!\nNome: ${nome}\nIdentificador: ${identificador}\nE-mail: ${email}\nCurso: ${curso}`,
            true
        );

        // Limpar campos
        document.getElementById('nome').value = '';
        document.getElementById('identificador').value = '';
        document.getElementById('email').value = '';
        document.getElementById('curso').value = '';
    } catch (error) {
        showMessage(messageCadastro, 'Erro de conexão com o servidor. Verifique se o backend está rodando.', false);
    }
}

// Função para buscar livros
async function buscarLivros() {
    const busca = document.getElementById('busca').value;

    // Limpar resultados anteriores
    resultsConsultaLivros.innerHTML = '';

    try {
        let url = `${API_BASE_URL}/livros?somenteDisponiveis=true`;
        if (busca) {
            url += `&search=${encodeURIComponent(busca)}`;
        }

        const response = await fetch(url);
        const livros = await response.json();

        if (!response.ok) {
            resultsConsultaLivros.innerHTML = '<p>Erro ao buscar livros.</p>';
            return;
        }

        // Exibir resultados
        if (livros.length === 0) {
            resultsConsultaLivros.innerHTML = '<p>Nenhum livro disponível encontrado.</p>';
            return;
        }

        livros.forEach(livro => {
            const livroElement = document.createElement('div');
            livroElement.className = 'livro-item';
            livroElement.innerHTML = `
                <h3>${livro.titulo}</h3>
                <p><strong>Autor:</strong> ${livro.autor}</p>
                <p><strong>ISBN:</strong> ${livro.isbn}</p>
                <p class="disponivel"><strong>Status:</strong> Disponível</p>
            `;
            resultsConsultaLivros.appendChild(livroElement);
        });
    } catch (error) {
        resultsConsultaLivros.innerHTML = '<p>Erro de conexão com o servidor. Verifique se o backend está rodando.</p>';
    }
}

// Função para visualizar pontuação
async function verPontuacao() {
    const identificador = document.getElementById('identificadorPontuacao').value;

    if (!identificador) {
        showMessage(messagePontuacao, 'Por favor, digite seu identificador.', false);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/alunos/${identificador}/pontuacao`);
        const data = await response.json();

        if (!response.ok) {
            showMessage(messagePontuacao, data.error || 'Aluno não encontrado. Verifique o identificador.', false);
            return;
        }

        const { aluno, livrosLidos, classificacao, classe } = data;
        let classificacaoTexto;
        switch(classificacao) {
            case 'Leitor Iniciante': classificacaoTexto = 'Leitor Iniciante'; break;
            case 'Leitor Regular': classificacaoTexto = 'Leitor Regular'; break;
            case 'Leitor Ativo': classificacaoTexto = 'Leitor Ativo'; break;
            case 'Leitor Extremo': classificacaoTexto = 'Leitor Extremo'; break;
            default: classificacaoTexto = classificacao;
        }

        // Exibir informações de pontuação
        pontuacaoInfo.innerHTML = `
            <h3>Sua Pontuação</h3>
            <p><strong>Aluno:</strong> ${aluno.nome}</p>
            <p><strong>Identificador:</strong> ${aluno.identificador}</p>
            <p><strong>Curso:</strong> ${aluno.curso}</p>
            <p><strong>Livros lidos no semestre:</strong> ${livrosLidos}</p>
            <div class="classificacao ${classe}">
                <strong>Classificação:</strong> ${classificacaoTexto}
            </div>
        `;
        pontuacaoInfo.style.display = 'block';

        // Limpar campo
        document.getElementById('identificadorPontuacao').value = '';
    } catch (error) {
        showMessage(messagePontuacao, 'Erro de conexão com o servidor. Verifique se o backend está rodando.', false);
    }
}

// Event Listeners
btnCadastro.addEventListener('click', showCadastroForm);
btnConsultaLivros.addEventListener('click', showConsultaLivrosForm);
btnPontuacao.addEventListener('click', showPontuacaoForm);

voltarCadastro.addEventListener('click', showMainMenu);
voltarConsultaLivros.addEventListener('click', showMainMenu);
voltarPontuacao.addEventListener('click', showMainMenu);

confirmarCadastro.addEventListener('click', processarCadastro);
btnBuscar.addEventListener('click', buscarLivros);
btnVerPontuacao.addEventListener('click', verPontuacao);

// Permitir busca com Enter
document.getElementById('busca').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        buscarLivros();
    }
});

document.getElementById('identificadorPontuacao').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        verPontuacao();
    }
});

// Inicialização
showMainMenu();