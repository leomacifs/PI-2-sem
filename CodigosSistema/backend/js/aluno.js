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
                    localStorage.setItem('alunoData', JSON.stringify(data.aluno)); // Salva dados
                    window.location.href = 'Página_Inicial_A.html';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert('Erro de conexão');
            }
        });
    }
});