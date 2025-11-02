// Sistema de Biblioteca - Bibliotecário
console.log('✅ Sistema do Bibliotecário carregado!');

const API_URL = 'http://localhost:3001/api/bibliotecario';

// ==================== CADASTRAR LIVRO ====================
async function cadastrarLivro(event) {
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

    console.log('📤 Enviando dados do livro...', { titulo, autor, isbn, categoria });

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
        console.log('📥 Resposta do servidor:', data);

        if (data.success) {
            alert('✅ Livro cadastrado com sucesso no banco de dados!');
            window.location.href = 'Cadastro_Livro_Confirmado.html';
        } else {
            alert(`❌ Erro: ${data.message}`);
        }

    } catch (error) {
        console.error('❌ Erro de conexão:', error);
        alert('❌ Erro de conexão com o servidor.');
    }
}

// ==================== CONFIGURAÇÃO INICIAL ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Página do bibliotecário carregada:', window.location.pathname);
    
    // Cadastro de Livros
    const formCadastroLivro = document.querySelector('form');
    if (formCadastroLivro && window.location.href.includes('Cadastrar_Livro.html')) {
        formCadastroLivro.addEventListener('submit', cadastrarLivro);
    }
    
    // Testar conexão quando a página inicial carregar
    if (window.location.href.includes('Página_Inicial_B.html')) {
        testarConexao();
    }
});

// Testar conexão com o servidor
async function testarConexao() {
    try {
        const response = await fetch('http://localhost:3001/api/status');
        const data = await response.json();
        console.log('🔍 Status do servidor:', data);
    } catch (error) {
        console.log('❌ Servidor não está respondendo');
    }
}