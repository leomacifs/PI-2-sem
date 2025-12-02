const API_URL = 'http://localhost:3001/api/aluno'; 
const API_LIB_URL = 'http://localhost:3001/api/bibliotecario';

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. LÓGICA DE CADASTRO DE LIVRO 
    const formCadastro = document.querySelector('form');

    if (formCadastro && document.getElementById('titulo')) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede a página de recarregar

            const dadosLivro = {
                titulo: document.getElementById('titulo').value,
                autor: document.getElementById('autor').value,
                codigo: document.getElementById('codigo').value,
                categoria: document.getElementById('categoria').value
            };

            console.log("A tentar cadastrar:", dadosLivro); 

            try {
                const response = await fetch(`${API_LIB_URL}/cadastrar-livro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosLivro)
                });

                const data = await response.json();

                if (data.success) {
                    alert('Livro cadastrado com sucesso!');
                    window.location.href = 'Cadastro_Confirmado/Cadastro_Livro_Confirmado.html'; 
                } else {
                    alert('Erro ao cadastrar: ' + data.message);
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro de conexão com o servidor. Verifique se o node server.js está a correr.');
            }
        });
    }

    // 2. LÓGICA DO HISTÓRICO 
    const listaHistorico = document.getElementById('listaHistorico');
    if (listaHistorico) {
        carregarHistoricoCompleto();
    }

    async function carregarHistoricoCompleto() {
        try {
            const response = await fetch(`${API_LIB_URL}/historico-completo`);
            const data = await response.json();
            if (data.success) {
                listaHistorico.innerHTML = '';
                if (data.historico.length === 0) {
                    listaHistorico.innerHTML = '<p style="text-align:center;">Nenhum registro encontrado.</p>';
                    return;
                }
                data.historico.forEach(item => {
                    const dataFormatada = new Date(item.data_evento).toLocaleString('pt-BR');
                    const classeBadge = item.tipo === 'Empréstimo' ? 'loan' : 'return';
                    listaHistorico.innerHTML += `
                        <div class="history-item">
                            <div class="history-info">
                                <p><strong>${item.tipo}:</strong> ${item.titulo}</p>
                                <p><strong>Aluno:</strong> ${item.nome} (${item.ra})</p>
                                <p><small>${dataFormatada}</small></p>
                            </div>
                            <div class="history-badge ${classeBadge}">${item.tipo}</div>
                        </div>`;
                });
            }
        } catch (error) { console.error('Erro Histórico:', error); }
    }

    // 3. LÓGICA DE LOGIN 
    const loginForm = document.getElementById('formLogin'); 
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const ra = loginForm.querySelector('input[name="ra"]').value;
            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ra })
                });
                const data = await response.json();
                if (data.success) {
                    localStorage.setItem('alunoData', JSON.stringify(data.aluno));
                    window.location.href = 'Classificacao_A.html';
                } else { alert(data.message); }
            } catch (error) { console.error(error); alert('Erro de conexão'); }
        });
    }
});