// Sistema de Biblioteca - Bibliotecário
console.log('✅ Sistema do Bibliotecário carregado!');
console.log('🔗 Script carregado de:', window.location.href);

const API_URL = 'http://localhost:3001/api/bibliotecario';

// ==================== CADASTRAR LIVRO ====================
async function cadastrarLivro(event) {
    console.log('🎯 EVENTO: Formulário submetido!');
    
    // Prevenir comportamento padrão do formulário
    event.preventDefault();
    console.log('✅ Comportamento padrão prevenido');
    
    const titulo = document.getElementById('livro').value;
    const autor = document.getElementById('autor').value;
    const isbn = document.getElementById('qtd').value;
    const categoria = document.getElementById('genero').value;

    console.log('📝 Dados capturados:', { titulo, autor, isbn, categoria });

    // Validação
    if (!titulo || !autor || !isbn || !categoria) {
        alert('Por favor, preencha todos os campos.');
        console.log('❌ Validação falhou - campos vazios');
        return;
    }
    console.log('✅ Validação passou');

    console.log('📤 Enviando dados para API...');

    try {
        console.log('🔄 Fazendo requisição para:', `${API_URL}/cadastrar-livro`);
        
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

        console.log('📥 Resposta recebida. Status:', response.status);
        const data = await response.json();
        console.log('📊 Dados da resposta:', data);

        if (data.success) {
            console.log('✅ Sucesso - Redirecionando...');
            alert('✅ Livro cadastrado com sucesso no banco de dados!');
            window.location.href = 'Cadastro_Livro_Confirmado.html';
        } else {
            console.log('❌ Erro na resposta:', data.message);
            alert(`❌ Erro: ${data.message}`);
        }

    } catch (error) {
        console.error('❌ Erro de conexão:', error);
        alert('❌ Erro de conexão com o servidor.');
    }
}

// ==================== CONFIGURAÇÃO INICIAL ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Carregado - Procurando formulário...');
    
    // Cadastro de Livros
    const formCadastroLivro = document.querySelector('form');
    console.log('🔍 Formulário encontrado:', formCadastroLivro);
    
    if (formCadastroLivro && window.location.href.includes('Cadastrar_Livro.html')) {
        console.log('✅ Configurando evento no formulário');
        formCadastroLivro.addEventListener('submit', cadastrarLivro);
        
        // Também adicionar pelo ID para garantir
        const formById = document.getElementById('formLivro');
        if (formById) {
            console.log('✅ Formulário também encontrado pelo ID');
            formById.addEventListener('submit', cadastrarLivro);
        }
    } else {
        console.log('❌ Formulário NÃO encontrado ou página errada');
        console.log('📍 URL atual:', window.location.href);
    }
});

// Testar conexão com o servidor
async function testarConexao() {
    try {
        console.log('🔗 Testando conexão com servidor...');
        const response = await fetch('http://localhost:3001/api/status');
        const data = await response.json();
        console.log('📡 Status do servidor:', data);
    } catch (error) {
        console.log('❌ Servidor não está respondendo');
    }
}