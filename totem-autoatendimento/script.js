// Elementos do DOM
const mainMenu = document.getElementById('mainMenu');
const formRetirada = document.getElementById('formRetirada');
const formDevolucao = document.getElementById('formDevolucao');

const btnRetirada = document.getElementById('btnRetirada');
const btnDevolucao = document.getElementById('btnDevolucao');

const voltarRetirada = document.getElementById('voltarRetirada');
const voltarDevolucao = document.getElementById('voltarDevolucao');

const confirmarRetirada = document.getElementById('confirmarRetirada');
const confirmarDevolucao = document.getElementById('confirmarDevolucao');

const messageRetirada = document.getElementById('messageRetirada');
const messageDevolucao = document.getElementById('messageDevolucao');

// Funções para navegação
function showMainMenu() {
    mainMenu.style.display = 'flex';
    formRetirada.style.display = 'none';
    formDevolucao.style.display = 'none';
}

function showRetiradaForm() {
    mainMenu.style.display = 'none';
    formRetirada.style.display = 'block';
    formDevolucao.style.display = 'none';
    clearMessages();
}

function showDevolucaoForm() {
    mainMenu.style.display = 'none';
    formRetirada.style.display = 'none';
    formDevolucao.style.display = 'block';
    clearMessages();
}

function clearMessages() {
    messageRetirada.style.display = 'none';
    messageDevolucao.style.display = 'none';
}

function showMessage(element, message, isSuccess) {
    element.textContent = message;
    element.className = isSuccess ? 'message success' : 'message error';
    element.style.display = 'block';
}

// Funções para processar retirada e devolução
function processarRetirada() {
    const identificador = document.getElementById('identificadorRetirada').value;
    const codigoLivro = document.getElementById('codigoLivro').value;
    
    if (!identificador || !codigoLivro) {
        showMessage(messageRetirada, 'Por favor, preencha todos os campos.', false);
        return;
    }
    
    // Aqui você faria uma requisição para o backend
    // Por enquanto, vamos apenas simular
    const dataHora = new Date().toLocaleString('pt-BR');
    
    showMessage(
        messageRetirada, 
        `Retirada registrada com sucesso!\nAluno: ${identificador}\nLivro: ${codigoLivro}\nData/Hora: ${dataHora}`, 
        true
    );
    
    // Limpar campos
    document.getElementById('identificadorRetirada').value = '';
    document.getElementById('codigoLivro').value = '';
}

function processarDevolucao() {
    const identificador = document.getElementById('identificadorDevolucao').value;
    const codigoLivro = document.getElementById('codigoLivroDevolucao').value;
    
    if (!identificador || !codigoLivro) {
        showMessage(messageDevolucao, 'Por favor, preencha todos os campos.', false);
        return;
    }
    
    // Aqui você faria uma requisição para o backend
    // Por enquanto, vamos apenas simular
    const dataHora = new Date().toLocaleString('pt-BR');
    
    showMessage(
        messageDevolucao, 
        `Devolução registrada com sucesso!\nAluno: ${identificador}\nLivro: ${codigoLivro}\nData/Hora: ${dataHora}`, 
        true
    );
    
    // Limpar campos
    document.getElementById('identificadorDevolucao').value = '';
    document.getElementById('codigoLivroDevolucao').value = '';
}

// Event Listeners
btnRetirada.addEventListener('click', showRetiradaForm);
btnDevolucao.addEventListener('click', showDevolucaoForm);

voltarRetirada.addEventListener('click', showMainMenu);
voltarDevolucao.addEventListener('click', showMainMenu);

confirmarRetirada.addEventListener('click', processarRetirada);
confirmarDevolucao.addEventListener('click', processarDevolucao);

// Inicialização
showMainMenu();