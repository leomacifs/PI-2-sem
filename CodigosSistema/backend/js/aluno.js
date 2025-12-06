const API_URL = '/api/aluno'; 

document.addEventListener('DOMContentLoaded', function() {
    // --- LÓGICA DE LOGIN ---
    const loginForm = document.getElementById('formLogin'); 
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const ra = loginForm.querySelector('input[name="ra"]').value;

            try {
                // Envia requisição para o servidor
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ra })
                });
                
                const data = await response.json();

                if (data.success) {
                    // Salva dados do aluno no navegador (LocalStorage)
                    localStorage.setItem('alunoData', JSON.stringify(data.aluno));
                    window.location.href = 'BemVindo.html'; // Redireciona
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error(error);
                alert('Erro de conexão.');
            }
        });
    }

    // --- LÓGICA DE CADASTRO ---
    const cadastroForm = document.querySelector('form');
    // Verifica se estamos na página de cadastro
    if (cadastroForm && window.location.href.includes('Cadastrar.html')) {
        cadastroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(cadastroForm);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch(`${API_URL}/cadastrar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();

                if (result.success) {
                    window.location.href = "Cadastro_Aluno_Confirmado.html";
                } else {
                    alert('Erro: ' + result.message);
                }
            } catch (error) {
                alert('Erro de conexão.');
            }
        });
    }
});