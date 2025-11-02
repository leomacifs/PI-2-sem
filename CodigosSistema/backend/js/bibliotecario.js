const API_URL = 'http://localhost:3001/api/bibliotecario';

// ==================== CADASTRAR LIVRO ====================
async function cadastrarLivro(event) {
    
    // Prevenir comportamento padrão do formulário
    event.preventDefault();
    
    const titulo = document.getElementById('livro').value;
    const autor = document.getElementById('autor').value;
    const isbn = document.getElementById('qtd').value;
    const categoria = document.getElementById('genero').value;


    // Validação
    if (!titulo || !autor || !isbn || !categoria) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {        
        const response = await fetch(`${API_URL}/cadastrar-livro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                titulo: titulo,
                autor: autor,
                isbn: isbn,
                categoria: categoria
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Livro cadastrado com sucesso no banco de dados!');
            window.location.href = 'Cadastro_Livro_Confirmado.html';
        } else {
            alert(`❌ Erro: ${data.message}`);
        }

    } catch (error) {
        alert('❌ Erro de conexão com o servidor.');
    }
}

// ==================== CONFIGURAÇÃO INICIAL ====================
document.addEventListener('DOMContentLoaded', function() {
    
    // Cadastro de Livros
    const formCadastroLivro = document.querySelector('form');
    
    if (formCadastroLivro && window.location.href.includes('Cadastrar_Livro.html')) {
        formCadastroLivro.addEventListener('submit', cadastrarLivro);
        
        // Também adicionar pelo ID para garantir
        const formById = document.getElementById('formLivro');
        if (formById) {
            formById.addEventListener('submit', cadastrarLivro);
        }
    } 
});
