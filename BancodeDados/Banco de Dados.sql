USE sistema_biblioteca;

CREATE TABLE aluno (
    id_aluno INT AUTO_INCREMENT PRIMARY KEY,
    ra INT NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    pontuacao INT DEFAULT 0
);

CREATE TABLE livro (
    id_livro INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    categoria VARCHAR(50)
);

CREATE TABLE exemplar (
    id_exemplar INT AUTO_INCREMENT PRIMARY KEY,
    id_livro INT NOT NULL,
    localizacao VARCHAR(100),
    disponivel BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_livro) REFERENCES livro(id_livro) ON DELETE CASCADE
);

CREATE TABLE emprestimo (
    id_emprestimo INT AUTO_INCREMENT PRIMARY KEY,
    id_aluno INT NOT NULL,
    id_exemplar INT NOT NULL,
    data_retirada DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_devolucao_prevista DATETIME NOT NULL,
    data_devolucao_real DATETIME NULL,
    status VARCHAR(15),
    FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno) ON DELETE CASCADE,
    FOREIGN KEY (id_exemplar) REFERENCES exemplar(id_exemplar) ON DELETE CASCADE
);

CREATE TABLE classificacao (
    id_classificacao INT AUTO_INCREMENT PRIMARY KEY,
    id_aluno INT NOT NULL,
    semestre VARCHAR(10) NOT NULL, -- Ex: '2024.1'
    livros_lidos INT DEFAULT 0,
    pontuacao_semestral INT DEFAULT 0,
    FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno) ON DELETE CASCADE,
    UNIQUE KEY unique_aluno_semestre (id_aluno, semestre)
);


