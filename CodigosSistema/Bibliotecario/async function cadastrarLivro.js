async function cadastrarLivro(dados) {
  const resposta = await fetch('/livros', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return await resposta.json();
}