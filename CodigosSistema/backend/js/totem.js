const API_URL = 'http://localhost:3001/api/totem';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');

    // 1. Lógica de RETIRADA
    if (form && window.location.href.includes('Retirada_Livro.html')) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            // IMPORTANTE: O HTML precisa ter IDs ou names corretos
            // Assumindo: primeiro input é RA, segundo input é Codigo do Livro
            const inputs = document.querySelectorAll('input');
            const ra = inputs[0].value;
            const codigo_livro = inputs[1].value;

            try {
                const response = await fetch(`${API_URL}/retirada`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ra, codigo_livro })
                });
                const data = await response.json();

                if (data.success) {
                    window.location.href = 'Retirada_Confirmada.html';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert('Erro no sistema do Totem.');
            }
        });
    }

    // 2. Lógica de DEVOLUÇÃO
    if (form && window.location.href.includes('Devolucao_Livro.html')) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const codigo_livro = document.querySelector('input').value;

            try {
                const response = await fetch(`${API_URL}/devolucao`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ codigo_livro })
                });
                const data = await response.json();

                if (data.success) {
                    window.location.href = 'Devolucao_Confirmada.html';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert('Erro no sistema do Totem.');
            }
        });
    }
});