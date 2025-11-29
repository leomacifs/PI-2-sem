const API_URL = 'http://localhost:3001/api/totem';

document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA DE RETIRADA ---
    const formRetirada = document.getElementById('formRetirada');
    if (formRetirada) {
        formRetirada.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const formData = new FormData(formRetirada);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_URL}/retirada`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    window.location.href = 'Retirada_Confirmada.html';
                } else {
                    alert('Erro: ' + result.message);
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro de conexão com o servidor.');
            }
        });
    }

    // --- LÓGICA DE DEVOLUÇÃO ---
    const formDevolucao = document.getElementById('formDevolucao');
    if (formDevolucao) {
        formDevolucao.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(formDevolucao);
            const data = Object.fromEntries(formData.entries()); 

            try {
                const response = await fetch(`${API_URL}/devolucao`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    window.location.href = 'Devolucao_Confirmada.html';
                } else {
                    alert('Erro: ' + result.message);
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro de conexão com o servidor.');
            }
        });
    }
});