// URL base da API
const API_BASE_URL = 'http://localhost:3001/api';

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
async function processarCadastroLivro() {
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

    try {
        const response = await fetch(`${API_BASE_URL}/livros`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, autor, isbn, editora, ano, categoria })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(messageCadastroLivros, data.error || 'Erro ao cadastrar livro.', false);
            return;
        }

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
    } catch (error) {
        showMessage(messageCadastroLivros, 'Erro de conexão com o servidor. Verifique se o backend está rodando.', false);
    }
}

// Funções para Gerenciamento de Livros
async function carregarTodosLivros() {
    try {
        const response = await fetch(`${API_BASE_URL}/livros`);
        const livros = await response.json();

        if (!response.ok) {
            resultsGerenciamento.innerHTML = '<p>Erro ao carregar livros.</p>';
            return;
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
    } catch (error) {
        resultsGerenciamento.innerHTML = '<p>Erro de conexão com o servidor. Verifique se o backend está rodando.</p>';
    }
}

async function carregarLivrosEmprestados() {
    try {
        const response = await fetch(`${API_BASE_URL}/livros/emprestados`);
        const livrosEmprestados = await response.json();

        if (!response.ok) {
            resultsGerenciamento.innerHTML = '<p>Erro ao carregar livros emprestados.</p>';
            return;
        }

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
    } catch (error) {
        resultsGerenciamento.innerHTML = '<p>Erro de conexão com o servidor. Verifique se o backend está rodando.</p>';
    }
}

async function carregarHistoricoCompleto() {
    try {
        const response = await fetch(`${API_BASE_URL}/historico`);
        const historico = await response.json();

        if (!response.ok) {
            resultsGerenciamento.innerHTML = '<p>Erro ao carregar histórico.</p>';
            return;
        }

        resultsGerenciamento.innerHTML = '<h3>Histórico de Empréstimos e Devoluções</h3>';

        if (historico.length === 0) {
            resultsGerenciamento.innerHTML += '<p>Nenhum registro no histórico.</p>';
            return;
        }

        historico.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'emprestimo-item';
            itemElement.innerHTML = `
                <div class="info-emprestimo">
                    <p><strong>${item.tipo}:</strong> ${item.livro}</p>
                    <p><strong>Aluno:</strong> ${item.identificador}</p>
                    <p><strong>Data/Hora:</strong> ${item.dataHora}</p>
                </div>
                <span class="status ${item.tipo === 'Empréstimo' ? 'emprestado' : 'disponivel'}">
                    ${item.tipo}
                </span>
            `;
            resultsGerenciamento.appendChild(itemElement);
        });
    } catch (error) {
        resultsGerenciamento.innerHTML = '<p>Erro de conexão com o servidor. Verifique se o backend está rodando.</p>';
    }
}

// Funções para Relatórios de Classificação
async function carregarClassificacaoGeral() {
    try {
        const response = await fetch(`${API_BASE_URL}/relatorios/classificacao-geral`);
        const alunos = await response.json();

        if (!response.ok) {
            resultsRelatorios.innerHTML = '<p>Erro ao carregar classificação geral.</p>';
            return;
        }

        resultsRelatorios.innerHTML = '<h3>Classificação Geral dos Leitores</h3>';

        if (alunos.length === 0) {
            resultsRelatorios.innerHTML += '<p>Nenhum aluno cadastrado.</p>';
            return;
        }

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
                default: classificacaoTexto = aluno.classificacao;
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
        const totalAlunos = alunos.length || 1;
        const mediaLivros = (alunos.reduce((sum, aluno) => sum + aluno.livrosLidos, 0) / totalAlunos).toFixed(1);
        const topLeitor = alunos.length > 0 ? alunos[0] : null;
        
        const estatisticas = `
            <div class="estatisticas">
                <h3>Estatísticas Gerais</h3>
                <p><strong>Total de alunos:</strong> ${totalAlunos}</p>
                <p><strong>Média de livros lidos:</strong> ${mediaLivros}</p>
                ${topLeitor ? `<p><strong>Leitor com mais livros:</strong> ${topLeitor.nome} (${topLeitor.livrosLidos} livros)</p>` : ''}
            </div>
        `;

        resultsRelatorios.innerHTML += tabelaHTML + estatisticas;
    } catch (error) {
        resultsRelatorios.innerHTML = '<p>Erro de conexão com o servidor. Verifique se o backend está rodando.</p>';
    }
}

async function carregarClassificacaoPorCategoria() {
    try {
        const response = await fetch(`${API_BASE_URL}/relatorios/classificacao-categoria`);
        const categorias = await response.json();

        if (!response.ok) {
            resultsRelatorios.innerHTML = '<p>Erro ao carregar classificação por categoria.</p>';
            return;
        }

        resultsRelatorios.innerHTML = '<h3>Classificação por Categoria de Leitura</h3>';

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
    } catch (error) {
        resultsRelatorios.innerHTML = '<p>Erro de conexão com o servidor. Verifique se o backend está rodando.</p>';
    }
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