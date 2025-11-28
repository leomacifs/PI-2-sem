const API_URL = 'http://localhost:3001/api/aluno';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');

    // Lógica de LOGIN
    if (form && window.location.href.includes('Login.html')) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const ra = document.querySelector('input[name="ra"]').value;

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
            } catch (error) {
                console.error(error);
                alert('Erro de conexão');
            }
        });
    }

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
                console.error('Erro:', error);
                alert('Erro de conexão ao cadastrar.');
            }
        });
    }
});