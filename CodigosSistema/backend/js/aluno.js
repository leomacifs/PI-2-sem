const API_URL = '/api/aluno'; 

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('formLogin'); 
    const form = document.querySelector('form');

    // --- LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const raInput = loginForm.querySelector('input[name="ra"]');
            const ra = raInput.value;

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ra })
                });
                
                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('alunoData', JSON.stringify(data.aluno));
                    window.location.href = 'BemVindo.html'; 
                } else {
                    alert(data.message || 'RA não encontrado');
                }
            } catch (error) {
                console.error('Erro no Login:', error);
                alert('Erro de conexão com o servidor.');
            }
        });
    }

    // --- CADASTRO ALUNO ---
    if (form && window.location.href.includes('Cadastrar.html')) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
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
                    alert('Erro: ' + (result.message || 'Erro desconhecido'));
                }
            } catch (error) {
                console.error('Erro no Cadastro:', error);
                alert('Erro de conexão ao cadastrar.');
            }
        });
    }
});