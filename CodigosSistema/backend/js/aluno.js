const API_URL = 'http://localhost:3001/api/aluno';

document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA DE LOGIN ---
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
                } else {
                    alert(data.message || 'RA não encontrado');
                }
            } catch (error) {
                console.error('Erro no Login:', error);
                alert('Erro de conexão com o servidor.');
            }
        });
    }

    // --- LÓGICA DE CADASTRO ---
    const formCadastro = document.querySelector('form');
    
    // Verifica se estamos na página de cadastro (procurando pelo campo 'email')
    // e garante que NÃO é a página de login
    if (formCadastro && document.getElementById('email') && !loginForm) {
        
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o recarregamento da página

            // Captura os dados usando os IDs 
            const dadosAluno = {
                ra: document.getElementById('ra').value,
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                telefone: document.getElementById('telefone').value
            };

            console.log("A enviar cadastro:", dadosAluno);

            try {
                const response = await fetch(`${API_URL}/cadastrar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosAluno)
                });

                const result = await response.json();

                if (result.success) {
                    alert('Aluno cadastrado com sucesso!');
                    window.location.href = "Cadastro_Aluno_Confirmado.html";
                } else {
                    alert('Erro ao cadastrar: ' + (result.message || 'Erro desconhecido'));
                }
            } catch (error) {
                console.error('Erro no Cadastro:', error);
                alert('Erro de conexão. Verifique se o servidor (server.js) está ligado.');
            }
        });
    }
});