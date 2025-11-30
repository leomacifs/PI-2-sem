const API_URL = 'http://localhost:3001/api/aluno'; // URL base para alunos (login)

document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA DO HISTÓRICO
    const listaHistorico = document.getElementById('listaHistorico');

    if (listaHistorico) {
        carregarHistoricoCompleto();
    }

    async function carregarHistoricoCompleto() {
        try {
            const response = await fetch('http://localhost:3001/api/bibliotecario/historico-completo');
            const data = await response.json();

            if (data.success) {
                listaHistorico.innerHTML = '';

                if (data.historico.length === 0) {
                    listaHistorico.innerHTML = '<p style="text-align:center; padding:20px;">Nenhum registro encontrado no banco de dados.</p>';
                    return;
                }

                data.historico.forEach(item => {
                    // Formata a data
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

    // --- LÓGICA DE LOGIN E CADASTRO
    const loginForm = document.getElementById('formLogin'); 
    const formCadastro = document.querySelector('form');

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
                } else {
                    alert(data.message);
                }
            } catch (error) { console.error(error); alert('Erro de conexão'); }
        });
    }
});
