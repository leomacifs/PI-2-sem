// URL base para rotas do bibliotecário e aluno
const API_BIBLIOTECARIO = '/api/bibliotecario';
const API_ALUNO = '/api/aluno';

document.addEventListener('DOMContentLoaded', function() {
    
    // ==================== 1. LÓGICA DO HISTÓRICO ====================
    const listaHistorico = document.getElementById('listaHistorico');

    if (listaHistorico) {
        carregarHistoricoCompleto();
    }

    async function carregarHistoricoCompleto() {
        try {
            const response = await fetch(`${API_BIBLIOTECARIO}/historico-completo`);
            const data = await response.json();

            if (data.success) {
                listaHistorico.innerHTML = '';

                if (data.historico.length === 0) {
                    listaHistorico.innerHTML = '<p style="text-align:center; padding:20px;">Nenhum registro encontrado.</p>';
                    return;
                }

                data.historico.forEach(item => {
                    const dataFormatada = new Date(item.data_evento).toLocaleString('pt-BR');
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
                listaHistorico.innerHTML = `<p>Erro: ${data.message}</p>`;
            }
        } catch (error) {
            console.error('Erro:', error);
            listaHistorico.innerHTML = '<p style="color:red; text-align:center;">Erro de conexão com o servidor.</p>';
        }
    }

    // ==================== 2. LÓGICA DE CADASTRO DE LIVROS ====================
    const formCadastroLivro = document.querySelector('form');
    const inputCodigoLivro = document.querySelector('input[name="codigo"]');

    if (formCadastroLivro && inputCodigoLivro) {
        formCadastroLivro.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(formCadastroLivro);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_BIBLIOTECARIO}/cadastrar-livro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    // Redireciona para a pasta de confirmação
                    window.location.href = 'Cadastro_Confirmado/Cadastro_Livro_Confirmado.html';
                } else {
                    alert('Erro ao cadastrar: ' + result.message);
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro de conexão ao cadastrar livro.');
            }
        });
    }

    // ==================== 3. LÓGICA DE LOGIN  ====================
    const loginForm = document.getElementById('formLogin'); 
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const ra = loginForm.querySelector('input[name="ra"]').value;
            try {
                const response = await fetch(`${API_ALUNO}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ra })
                });
                const data = await response.json();
                if (data.success) {
                    localStorage.setItem('alunoData', JSON.stringify(data.aluno));
                    window.location.href = 'Classificacao_A.html';
                } else {
                    alert(data.message);
                }
            } catch (error) { console.error(error); alert('Erro de conexão'); }
        });
    }
});