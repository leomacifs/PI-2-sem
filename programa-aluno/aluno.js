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
function processarCadastro() {
    const nome = document.getElementById('nome').value;
    const identificador = document.getElementById('identificador').value;
    const email = document.getElementById('email').value;
    const curso = document.getElementById('curso').value;

    if (!nome || !identificador || !email || !curso) {
        showMessage(messageCadastro, 'Por favor, preencha todos os campos.', false);
        return;
    }

    // Aqui você faria uma requisição para o backend
    // Por enquanto, vamos apenas simular
    const aluno = {
        nome: nome,
        identificador: identificador,
        email: email,
        curso: curso
    };

    // Salvar no localStorage para simular persistência (apenas para demonstração)
    localStorage.setItem('aluno_' + identificador, JSON.stringify(aluno));

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
}

// Função para buscar livros
function buscarLivros() {
    const busca = document.getElementById('busca').value;

    // Aqui você faria uma requisição para o backend
    // Por enquanto, vamos simular alguns livros
    const livros = [
        { titulo: 'Introdução à Programação', autor: 'João Silva', isbn: '1234567890', disponivel: true },
        { titulo: 'Estruturas de Dados', autor: 'Maria Santos', isbn: '0987654321', disponivel: true },
        { titulo: 'Banco de Dados', autor: 'Pedro Oliveira', isbn: '1122334455', disponivel: false },
        { titulo: 'Redes de Computadores', autor: 'Ana Costa', isbn: '5566778899', disponivel: true },
        { titulo: 'Engenharia de Software', autor: 'Carlos Mendes', isbn: '6677889900', disponivel: true },
        { titulo: 'Sistemas Operacionais', autor: 'Fernanda Lima', isbn: '7788990011', disponivel: true }
    ];

    // Limpar resultados anteriores
    resultsConsultaLivros.innerHTML = '';

    // Filtrar livros se houver busca
    let livrosFiltrados = livros;
    if (busca) {
        const buscaLower = busca.toLowerCase();
        livrosFiltrados = livros.filter(livro => 
            livro.titulo.toLowerCase().includes(buscaLower) ||
            livro.autor.toLowerCase().includes(buscaLower) ||
            livro.isbn.includes(busca)
        );
    }

    // Exibir apenas livros disponíveis
    livrosFiltrados = livrosFiltrados.filter(livro => livro.disponivel);

    // Exibir resultados
    if (livrosFiltrados.length === 0) {
        resultsConsultaLivros.innerHTML = '<p>Nenhum livro disponível encontrado.</p>';
        return;
    }

    livrosFiltrados.forEach(livro => {
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
}

// Função para visualizar pontuação
function verPontuacao() {
    const identificador = document.getElementById('identificadorPontuacao').value;

    if (!identificador) {
        showMessage(messagePontuacao, 'Por favor, digite seu identificador.', false);
        return;
    }

    // Verificar se o aluno existe (apenas para demonstração)
    const alunoSalvo = localStorage.getItem('aluno_' + identificador);
    if (!alunoSalvo) {
        showMessage(messagePontuacao, 'Aluno não encontrado. Verifique o identificador.', false);
        return;
    }

    const aluno = JSON.parse(alunoSalvo);

    // Aqui você faria uma requisição para o backend para obter a pontuação real
    // Por enquanto, vamos simular uma pontuação aleatória
    const livrosLidos = Math.floor(Math.random() * 30); // Entre 0 e 29

    let classificacao, classeCSS;
    if (livrosLidos <= 5) {
        classificacao = 'Leitor Iniciante';
        classeCSS = 'iniciante';
    } else if (livrosLidos <= 10) {
        classificacao = 'Leitor Regular';
        classeCSS = 'regular';
    } else if (livrosLidos <= 20) {
        classificacao = 'Leitor Ativo';
        classeCSS = 'ativo';
    } else {
        classificacao = 'Leitor Extremo';
        classeCSS = 'extremo';
    }

    // Exibir informações de pontuação
    pontuacaoInfo.innerHTML = `
        <h3>Sua Pontuação</h3>
        <p><strong>Aluno:</strong> ${aluno.nome}</p>
        <p><strong>Identificador:</strong> ${aluno.identificador}</p>
        <p><strong>Curso:</strong> ${aluno.curso}</p>
        <p><strong>Livros lidos no semestre:</strong> ${livrosLidos}</p>
        <div class="classificacao ${classeCSS}">
            <strong>Classificação:</strong> ${classificacao}
        </div>
    `;
    pontuacaoInfo.style.display = 'block';

    // Limpar campo
    document.getElementById('identificadorPontuacao').value = '';
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