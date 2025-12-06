const API_BIBLIOTECARIO = '/api/bibliotecario';

document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA DE CADASTRO DE LIVRO ---
    const formLivro = document.querySelector('form');
    // Verifica se tem campo "codigo" para saber se é form de livro
    if (formLivro && formLivro.querySelector('input[name="codigo"]')) {
        formLivro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formLivro);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_BIBLIOTECARIO}/cadastrar-livro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (result.success) {
                    window.location.href = 'Cadastro_Confirmado/Cadastro_Livro_Confirmado.html';
                } else {
                    alert('Erro: ' + result.message);
                }
            } catch (error) {
                alert('Erro de conexão.');
            }
        });
    }
});