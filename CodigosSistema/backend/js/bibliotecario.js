const API_URL = 'http://localhost:3001/api/bibliotecario';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    // LÓGICA DA TELA DE CLASSIFICAÇÃO
    const tabelaRanking = document.getElementById('tabela-ranking-body');
    const tabelaCategorias = document.getElementById('tabela-categorias-body');

    if (tabelaRanking) {
        carregarRelatorioClassificacao();
    }

    async function carregarRelatorioClassificacao() {
        try {
            const response = await fetch(`${API_URL}/relatorio-classificacao`);
            const data = await response.json();

            if (data.success) {
                renderizarRanking(data.ranking);
                calcularEstatisticas(data.ranking);
            } else {
                document.getElementById('mensagem-tabela').innerText = 'Erro ao carregar dados.';
            }
        } catch (error) {
            console.error('Erro:', error);
            document.getElementById('mensagem-tabela').innerText = 'Erro de conexão.';
        }
    }

    function renderizarRanking(listaAlunos) {
        tabelaRanking.innerHTML = '';
        const msg = document.getElementById('mensagem-tabela');
        
        if (listaAlunos.length === 0) {
            msg.innerText = 'Nenhum dado encontrado.';
            return;
        }
        msg.style.display = 'none';

        listaAlunos.forEach((aluno, index) => {
            const categoria = definirCategoria(aluno.total_lidos);
            const html = `
                <tr>
                    <td>${index + 1}º</td>
                    <td>${aluno.nome}</td>
                    <td>${aluno.ra}</td>
                    <td>${aluno.total_lidos}</td>
                    <td><span class="history-badge ${categoria.classe}">${categoria.nome}</span></td>
                </tr>
            `;
            tabelaRanking.innerHTML += html;
        });
    }

    function definirCategoria(qtd) {
        if (qtd > 20) return { nome: 'Leitor Extremo', classe: 'badge-extremo' };
        if (qtd > 10) return { nome: 'Leitor Ativo', classe: 'badge-ativo' };
        if (qtd > 5)  return { nome: 'Leitor Regular', classe: 'badge-regular' };
        return { nome: 'Leitor Iniciante', classe: 'badge-iniciante' };
    }

    function calcularEstatisticas(lista) {
        // Estatísticas Gerais
        const totalAlunos = lista.length;
        const totalLivros = lista.reduce((acc, curr) => acc + curr.total_lidos, 0);
        const media = totalAlunos > 0 ? (totalLivros / totalAlunos).toFixed(1) : 0;
        const topLeitor = lista.length > 0 ? `${lista[0].nome} (${lista[0].total_lidos})` : '-';

        document.getElementById('stat-total-alunos').innerText = totalAlunos;
        document.getElementById('stat-media-livros').innerText = media;
        document.getElementById('stat-top-leitor').innerText = topLeitor;

        // Contagem de Categorias
        const contagem = { 'Iniciante': 0, 'Regular': 0, 'Ativo': 0, 'Extremo': 0 };
        
        lista.forEach(a => {
            const cat = definirCategoria(a.total_lidos).nome.replace('Leitor ', '');
            if (contagem[cat] !== undefined) contagem[cat]++;
        });

        // Renderizar Tabela de Categorias
        tabelaCategorias.innerHTML = `
            <tr>
                <td>Leitor Iniciante</td>
                <td>até 5 livros</td>
                <td>${contagem['Iniciante']}</td>
                <td>${((contagem['Iniciante'] / totalAlunos) * 100).toFixed(0)}%</td>
            </tr>
            <tr>
                <td>Leitor Regular</td>
                <td>6 a 10 livros</td>
                <td>${contagem['Regular']}</td>
                <td>${((contagem['Regular'] / totalAlunos) * 100).toFixed(0)}%</td>
            </tr>
            <tr>
                <td>Leitor Ativo</td>
                <td>11 a 20 livros</td>
                <td>${contagem['Ativo']}</td>
                <td>${((contagem['Ativo'] / totalAlunos) * 100).toFixed(0)}%</td>
            </tr>
            <tr>
                <td>Leitor Extremo</td>
                <td>mais de 20 livros</td>
                <td>${contagem['Extremo']}</td>
                <td>${((contagem['Extremo'] / totalAlunos) * 100).toFixed(0)}%</td>
            </tr>
        `;
    }

    if (form && window.location.href.includes('Cadastrar_Livro')) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titulo = document.getElementById('titulo').value;
            const autor = document.getElementById('autor').value;
            const codigo = document.getElementById('codigo').value;
            const categoria = document.getElementById('categoria').value;

            try {
                const response = await fetch(`${API_URL}/cadastrar-livro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ titulo, autor, codigo, categoria }) 
                });
                const data = await response.json();

                if (data.success) {
                    alert('Livro Cadastrado!');
                    window.location.href = 'Cadastro_Confirmado/Cadastro_Livro_Confirmado.html';
                } else {
                    alert('Erro: ' + data.message);
                }
            } catch (error) {
                console.error(error);
                alert('Erro ao conectar com o servidor.');
            }
        });
    }

    const listaLivrosContainer = document.getElementById('lista-livros');
    
    if (listaLivrosContainer) {
        carregarLivros();
    }

    async function carregarLivros() {
        try {
            const response = await fetch(`${API_URL}/livros`);
            const data = await response.json();

            if (data.success) {
                listaLivrosContainer.innerHTML = '';

                if (data.livros.length === 0) {
                    listaLivrosContainer.innerHTML = '<p>Nenhum livro encontrado.</p>';
                    return;
                }

                // Para cada livro vindo do banco, cria o HTML
                data.livros.forEach(livro => {
                    const disponivelTexto = livro.disponivel ? 'Disponível' : 'Emprestado';
                    const classeStatus = livro.disponivel ? 'available' : 'borrowed'; 

                    const htmlLivro = `
                        <details class="book-item">
                            <summary>${livro.titulo}</summary>
                            <div class="book-details">
                                <p><strong>Autor:</strong> ${livro.autor}</p>
                                <p><strong>Código/ISBN:</strong> ${livro.isbn || livro.codigo || 'N/A'}</p>
                                <p><strong>Categoria:</strong> ${livro.categoria}</p>
                                <div class="status-bar ${classeStatus}">${disponivelTexto}</div>
                            </div>
                        </details>
                    `;
                    listaLivrosContainer.innerHTML += htmlLivro;
                });
            } else {
                listaLivrosContainer.innerHTML = '<p>Erro ao carregar dados.</p>';
                console.error(data.message);
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            listaLivrosContainer.innerHTML = '<p>Erro de conexão com o sistema.</p>';
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
    
    // Verifica se estamos na página de Histórico Completo procurando pelo ID da lista
    const listaHistorico = document.getElementById('listaHistorico');

    if (listaHistorico) {
        carregarHistoricoCompleto();
    }

    async function carregarHistoricoCompleto() {
        try {
            // Chama a rota que criamos no passo 1
            const response = await fetch('http://localhost:3001/api/bibliotecario/historico-completo');
            const data = await response.json();

            if (data.success) {
                listaHistorico.innerHTML = ''; // Limpa a mensagem de "Carregando..."

                if (data.historico.length === 0) {
                    listaHistorico.innerHTML = '<p style="text-align:center; padding:20px;">Nenhum registro nos últimos 6 meses.</p>';
                    return;
                }

                data.historico.forEach(item => {
                    const dataFormatada = new Date(item.data_evento).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    });

                    const classeBadge = item.tipo === 'Empréstimo' ? 'loan' : 'return';

                    const itemHtml = `
                        <div class="history-item">
                            <div class="history-info">
                                <p><strong>${item.tipo}:</strong> ${item.titulo}</p>
                                <p><strong>Aluno:</strong> ${item.nome} <strong>RA:</strong> ${item.ra}</p>
                                <p><strong>Data/Hora:</strong> ${dataFormatada}</p>
                            </div>
                            <div class="history-badge ${classeBadge}">${item.tipo}</div>
                        </div>
                    `;
                    
                    listaHistorico.innerHTML += itemHtml;
                });
            } else {
                alert('Erro ao carregar dados: ' + data.message);
            }
        } catch (error) {
            console.error('Erro:', error);
            listaHistorico.innerHTML = '<p style="color:red; text-align:center;">Erro de conexão com o servidor.</p>';
        }
    }
});
});
