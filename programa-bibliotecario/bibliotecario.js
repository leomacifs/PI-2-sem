// Elementos do DOM
const mainMenu = document.getElementById('mainMenu');
const formCadastroLivros = document.getElementById('formCadastroLivros');
const formGerenciamento = document.getElementById('formGerenciamento');
const formRelatorios = document.getElementById('formRelatorios');

const btnCadastroLivros = document.getElementById('btnCadastroLivros');
const btnGerenciamento = document.getElementById('btnGerenciamento');
const btnRelatorios = document.getElementById('btnRelatorios');

const voltarCadastroLivros = document.getElementById('voltarCadastroLivros');
const voltarGerenciamento = document.getElementById('voltarGerenciamento');
const voltarRelatorios = document.getElementById('voltarRelatorios');

const confirmarCadastroLivro = document.getElementById('confirmarCadastroLivro');
const messageCadastroLivros = document.getElementById('messageCadastroLivros');

// Botões de filtro
const btnTodosLivros = document.getElementById('btnTodosLivros');
const btnLivrosEmprestados = document.getElementById('btnLivrosEmprestados');
const btnHistorico = document.getElementById('btnHistorico');
const btnClassificacaoGeral = document.getElementById('btnClassificacaoGeral');
const btnPorCategoria = document.getElementById('btnPorCategoria');

// Áreas de resultados
const resultsGerenciamento = document.getElementById('resultsGerenciamento');
const resultsRelatorios = document.getElementById('resultsRelatorios');

// Funções para navegação
function showMainMenu() {
    mainMenu.style.display = 'flex';
    formCadastroLivros.style.display = 'none';
    formGerenciamento.style.display = 'none';
    formRelatorios.style.display = 'none';
    clearMessages();
}

function showCadastroLivrosForm() {
    mainMenu.style.display = 'none';
    formCadastroLivros.style.display = 'block';
    formGerenciamento.style.display = 'none';
    formRelatorios.style.display = 'none';
    clearMessages();
}

function showGerenciamentoForm() {
    mainMenu.style.display = 'none';
    formCadastroLivros.style.display = 'none';
    formGerenciamento.style.display = 'block';
    formRelatorios.style.display = 'none';
    clearMessages();
    carregarTodosLivros(); // Carrega todos os livros por padrão
}

function showRelatoriosForm() {
    mainMenu.style.display = 'none';
    formCadastroLivros.style.display = 'none';
    formGerenciamento.style.display = 'none';
    formRelatorios.style.display = 'block';
    clearMessages();
    carregarClassificacaoGeral(); // Carrega classificação geral por padrão
}

function clearMessages() {
    messageCadastroLivros.style.display = 'none';
}

function showMessage(element, message, isSuccess) {
    element.textContent = message;
    element.className = isSuccess ? 'message success' : 'message error';
    element.style.display = 'block';
}

// Função para cadastro de livros
function processarCadastroLivro() {
    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const isbn = document.getElementById('isbn').value;
    const editora = document.getElementById('editora').value;
    const ano = document.getElementById('ano').value;
    const categoria = document.getElementById('categoria').value;

    if (!titulo || !autor || !isbn || !editora || !ano || !categoria) {
        showMessage(messageCadastroLivros, 'Por favor, preencha todos os campos.', false);
        return;
    }

    // Aqui você faria uma requisição para o backend
    // Por enquanto, vamos apenas simular
    const livro = {
        titulo: titulo,
        autor: autor,
        isbn: isbn,
        editora: editora,
        ano: ano,
        categoria: categoria,
        disponivel: true
    };

    // Salvar no localStorage para simular persistência (apenas para demonstração)
    let livros = JSON.parse(localStorage.getItem('livros_biblioteca') || '[]');
    livros.push(livro);
    localStorage.setItem('livros_biblioteca', JSON.stringify(livros));

    showMessage(
        messageCadastroLivros,
        `Livro cadastrado com sucesso!\nTítulo: ${titulo}\nAutor: ${autor}\nISBN: ${isbn}\nEditora: ${editora}\nAno: ${ano}\nCategoria: ${categoria}`,
        true
    );

    // Limpar campos
    document.getElementById('titulo').value = '';
    document.getElementById('autor').value = '';
    document.getElementById('isbn').value = '';
    document.getElementById('editora').value = '';
    document.getElementById('ano').value = '';
    document.getElementById('categoria').value = '';
}

// Funções para Gerenciamento de Livros
function carregarTodosLivros() {
    // Aqui você faria uma requisição para o backend
    // Por enquanto, vamos usar dados do localStorage ou simular
    let livros = JSON.parse(localStorage.getItem('livros_biblioteca') || '[]');
    
    // Se não houver livros, simular alguns
    if (livros.length === 0) {
        livros = [
            { titulo: 'Introdução à Programação', autor: 'João Silva', isbn: '1234567890', editora: 'Editora A', ano: 2020, categoria: 'Programação', disponivel: true },
            { titulo: 'Estruturas de Dados', autor: 'Maria Santos', isbn: '0987654321', editora: 'Editora B', ano: 2019, categoria: 'Programação', disponivel: false },
            { titulo: 'Banco de Dados', autor: 'Pedro Oliveira', isbn: '1122334455', editora: 'Editora C', ano: 2021, categoria: 'Banco de Dados', disponivel: true },
            { titulo: 'Redes de Computadores', autor: 'Ana Costa', isbn: '5566778899', editora: 'Editora D', ano: 2018, categoria: 'Redes', disponivel: true },
            { titulo: 'Engenharia de Software', autor: 'Carlos Mendes', isbn: '6677889900', editora: 'Editora E', ano: 2022, categoria: 'Engenharia', disponivel: true }
        ];
        localStorage.setItem('livros_biblioteca', JSON.stringify(livros));
    }

    resultsGerenciamento.innerHTML = `
        <h3>Todos os Livros (${livros.length})</h3>
        <div class="estatisticas">
            <p><strong>Disponíveis:</strong> ${livros.filter(l => l.disponivel).length}</p>
            <p><strong>Emprestados:</strong> ${livros.filter(l => !l.disponivel).length}</p>
        </div>
    `;

    livros.forEach(livro => {
        const livroElement = document.createElement('div');
        livroElement.className = 'livro-item';
        livroElement.innerHTML = `
            <h3>${livro.titulo}</h3>
            <p><strong>Autor:</strong> ${livro.autor}</p>
            <p><strong>ISBN:</strong> ${livro.isbn}</p>
            <p><strong>Editora:</strong> ${livro.editora} | <strong>Ano:</strong> ${livro.ano}</p>
            <p><strong>Categoria:</strong> ${livro.categoria}</p>
            <p class="status ${livro.disponivel ? 'disponivel' : 'emprestado'}">
                ${livro.disponivel ? 'Disponível' : 'Emprestado'}
            </p>
        `;
        resultsGerenciamento.appendChild(livroElement);
    });
}

function carregarLivrosEmprestados() {
    // Aqui você faria uma requisição para o backend
    // Por enquanto, vamos simular
    let livros = JSON.parse(localStorage.getItem('livros_biblioteca') || '[]');
    const livrosEmprestados = livros.filter(livro => !livro.disponivel);

    resultsGerenciamento.innerHTML = `<h3>Livros Emprestados (${livrosEmprestados.length})</h3>`;

    if (livrosEmprestados.length === 0) {
        resultsGerenciamento.innerHTML += '<p>Nenhum livro emprestado no momento.</p>';
        return;
    }

    livrosEmprestados.forEach(livro => {
        const livroElement = document.createElement('div');
        livroElement.className = 'livro-item';
        livroElement.innerHTML = `
            <h3>${livro.titulo}</h3>
            <p><strong>Autor:</strong> ${livro.autor}</p>
            <p><strong>ISBN:</strong> ${livro.isbn}</p>
            <p><strong>Editora:</strong> ${livro.editora} | <strong>Ano:</strong> ${livro.ano}</p>
            <p><strong>Categoria:</strong> ${livro.categoria}</p>
            <p class="status emprestado">Emprestado</p>
        `;
        resultsGerenciamento.appendChild(livroElement);
    });
}

function carregarHistoricoCompleto() {
    // Aqui você faria uma requisição para o backend
    // Por enquanto, vamos simular
    resultsGerenciamento.innerHTML = '<h3>Histórico de Empréstimos e Devoluções</h3>';

    // Simular histórico
    const historico = [
        { aluno: 'João Silva (RA123)', livro: 'Introdução à Programação', tipo: 'Empréstimo', data: '15/08/2023 10:30' },
        { aluno: 'Maria Santos (RA456)', livro: 'Estruturas de Dados', tipo: 'Empréstimo', data: '16/08/2023 14:15' },
        { aluno: 'João Silva (RA123)', livro: 'Introdução à Programação', tipo: 'Devolução', data: '22/08/2023 09:45' },
        { aluno: 'Pedro Oliveira (RA789)', livro: 'Banco de Dados', tipo: 'Empréstimo', data: '23/08/2023 11:20' },
        { aluno: 'Ana Costa (RA101)', livro: 'Redes de Computadores', tipo: 'Empréstimo', data: '25/08/2023 16:30' }
    ];

    historico.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'emprestimo-item';
        itemElement.innerHTML = `
            <div class="info-emprestimo">
                <p><strong>${item.tipo}:</strong> ${item.livro}</p>
                <p><strong>Aluno:</strong> ${item.aluno}</p>
                <p><strong>Data/Hora:</strong> ${item.data}</p>
            </div>
            <span class="status ${item.tipo === 'Empréstimo' ? 'emprestado' : 'disponivel'}">
                ${item.tipo}
            </span>
        `;
        resultsGerenciamento.appendChild(itemElement);
    });
}

// Funções para Relatórios de Classificação
function carregarClassificacaoGeral() {
    // Aqui você faria uma requisição para o backend
    // Por enquanto, vamos simular
    resultsRelatorios.innerHTML = '<h3>Classificação Geral dos Leitores</h3>';

    // Simular dados de alunos e suas classificações
    const alunos = [
        { nome: 'Ana Costa', identificador: 'RA101', livrosLidos: 25, classificacao: 'extremo' },
        { nome: 'João Silva', identificador: 'RA123', livrosLidos: 18, classificacao: 'ativo' },
        { nome: 'Maria Santos', identificador: 'RA456', livrosLidos: 8, classificacao: 'regular' },
        { nome: 'Pedro Oliveira', identificador: 'RA789', livrosLidos: 3, classificacao: 'iniciante' },
        { nome: 'Carlos Mendes', identificador: 'RA202', livrosLidos: 12, classificacao: 'ativo' }
    ];

    // Ordenar por livros lidos (decrescente)
    alunos.sort((a, b) => b.livrosLidos - a.livrosLidos);

    // Criar tabela
    let tabelaHTML = `
        <table>
            <thead>
                <tr>
                    <th>Posição</th>
                    <th>Aluno</th>
                    <th>Identificador</th>
                    <th>Livros Lidos</th>
                    <th>Classificação</th>
                </tr>
            </thead>
            <tbody>
    `;

    alunos.forEach((aluno, index) => {
        let classificacaoTexto;
        switch(aluno.classificacao) {
            case 'iniciante': classificacaoTexto = 'Leitor Iniciante'; break;
            case 'regular': classificacaoTexto = 'Leitor Regular'; break;
            case 'ativo': classificacaoTexto = 'Leitor Ativo'; break;
            case 'extremo': classificacaoTexto = 'Leitor Extremo'; break;
        }

        tabelaHTML += `
            <tr>
                <td>${index + 1}º</td>
                <td>${aluno.nome}</td>
                <td>${aluno.identificador}</td>
                <td>${aluno.livrosLidos}</td>
                <td class="classificacao-aluno ${aluno.classificacao}">${classificacaoTexto}</td>
            </tr>
        `;
    });

    tabelaHTML += '</tbody></table>';

    // Adicionar estatísticas
    const totalAlunos = alunos.length;
    const mediaLivros = (alunos.reduce((sum, aluno) => sum + aluno.livrosLidos, 0) / totalAlunos).toFixed(1);
    
    const estatisticas = `
        <div class="estatisticas">
            <h3>Estatísticas Gerais</h3>
            <p><strong>Total de alunos:</strong> ${totalAlunos}</p>
            <p><strong>Média de livros lidos:</strong> ${mediaLivros}</p>
            <p><strong>Leitor com mais livros:</strong> ${alunos[0].nome} (${alunos[0].livrosLidos} livros)</p>
        </div>
    `;

    resultsRelatorios.innerHTML += tabelaHTML + estatisticas;
}

function carregarClassificacaoPorCategoria() {
    // Aqui você faria uma requisição para o backend
    // Por enquanto, vamos simular
    resultsRelatorios.innerHTML = '<h3>Classificação por Categoria de Leitura</h3>';

    // Simular dados por categoria
    const categorias = [
        { classificacao: 'Leitor Iniciante', descricao: 'até 5 livros lidos no semestre', quantidade: 15, percentual: '30%' },
        { classificacao: 'Leitor Regular', descricao: '6 a 10 livros', quantidade: 20, percentual: '40%' },
        { classificacao: 'Leitor Ativo', descricao: '11 a 20 livros', quantidade: 10, percentual: '20%' },
        { classificacao: 'Leitor Extremo', descricao: 'mais de 20 livros', quantidade: 5, percentual: '10%' }
    ];

    let tabelaHTML = `
        <table>
            <thead>
                <tr>
                    <th>Classificação</th>
                    <th>Descrição</th>
                    <th>Quantidade</th>
                    <th>Percentual</th>
                </tr>
            </thead>
            <tbody>
    `;

    categorias.forEach(categoria => {
        tabelaHTML += `
            <tr>
                <td>${categoria.classificacao}</td>
                <td>${categoria.descricao}</td>
                <td>${categoria.quantidade}</td>
                <td>${categoria.percentual}</td>
            </tr>
        `;
    });

    tabelaHTML += '</tbody></table>';

    resultsRelatorios.innerHTML += tabelaHTML;
}

// Event Listeners
btnCadastroLivros.addEventListener('click', showCadastroLivrosForm);
btnGerenciamento.addEventListener('click', showGerenciamentoForm);
btnRelatorios.addEventListener('click', showRelatoriosForm);

voltarCadastroLivros.addEventListener('click', showMainMenu);
voltarGerenciamento.addEventListener('click', showMainMenu);
voltarRelatorios.addEventListener('click', showMainMenu);

confirmarCadastroLivro.addEventListener('click', processarCadastroLivro);

// Event Listeners para filtros
btnTodosLivros.addEventListener('click', carregarTodosLivros);
btnLivrosEmprestados.addEventListener('click', carregarLivrosEmprestados);
btnHistorico.addEventListener('click', carregarHistoricoCompleto);

btnClassificacaoGeral.addEventListener('click', carregarClassificacaoGeral);
btnPorCategoria.addEventListener('click', carregarClassificacaoPorCategoria);

// Inicialização
showMainMenu();