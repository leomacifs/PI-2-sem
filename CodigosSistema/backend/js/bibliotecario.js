const API_URL = 'http://localhost:3001/api/bibliotecario';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    

    if (form && window.location.href.includes('Cadastrar_Livro')) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
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

    const listaLivrosContainer = document.getElementById('lista-livros');
    
    if (listaLivrosContainer) {
        carregarLivros();
    }

    async function carregarLivros() {
        try {
            const response = await fetch(`${API_URL}/livros`);
            const data = await response.json();

            if (data.success) {
                listaLivrosContainer.innerHTML = '';

                if (data.livros.length === 0) {
                    listaLivrosContainer.innerHTML = '<p>Nenhum livro encontrado.</p>';
                    return;
                }

                // Para cada livro vindo do banco, cria o HTML
                data.livros.forEach(livro => {
                    const disponivelTexto = livro.disponivel ? 'Disponível' : 'Emprestado';
                    const classeStatus = livro.disponivel ? 'available' : 'borrowed'; 

                    const htmlLivro = `
                        <details class="book-item">
                            <summary>${livro.titulo}</summary>
                            <div class="book-details">
                                <p><strong>Autor:</strong> ${livro.autor}</p>
                                <p><strong>Código/ISBN:</strong> ${livro.isbn || livro.codigo || 'N/A'}</p>
                                <p><strong>Categoria:</strong> ${livro.categoria}</p>
                                <div class="status-bar ${classeStatus}">${disponivelTexto}</div>
                            </div>
                        </details>
                    `;
                    listaLivrosContainer.innerHTML += htmlLivro;
                });
            } else {
                listaLivrosContainer.innerHTML = '<p>Erro ao carregar dados.</p>';
                console.error(data.message);
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            listaLivrosContainer.innerHTML = '<p>Erro de conexão com o sistema.</p>';
        }
    }
});
