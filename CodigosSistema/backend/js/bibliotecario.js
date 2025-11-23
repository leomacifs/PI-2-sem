const API_URL = 'http://localhost:3001/api/bibliotecario';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    // Verifica se está na página de cadastro
    if (form && window.location.href.includes('Cadastrar_Livro')) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Não recarrega a página

            const titulo = document.getElementById('titulo').value;
            const autor = document.getElementById('autor').value;
            const codigo = document.getElementById('codigo').value;
            const categoria = document.getElementById('categoria').value;

            try {
                const response = await fetch(`${API_URL}/cadastrar-livro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ titulo, autor, codigo, categoria })
                });
                const data = await response.json();

                if (data.success) {
                    alert('Livro Cadastrado!');
                    window.location.href = 'Cadastro_Confirmado/Cadastro_Livro_Confirmado.html';
                } else {
                    alert('Erro: ' + data.message);
                }
            } catch (error) {
                console.error(error);
                alert('Erro ao conectar com o servidor.');
            }
        });
    }
});
