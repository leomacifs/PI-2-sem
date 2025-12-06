DROP DATABASE IF EXISTS biblioteca_db;
CREATE DATABASE biblioteca_db;
USE biblioteca_db;

-- Tabela de Alunos
CREATE TABLE alunos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ra VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  telefone VARCHAR(20),
  pontuacao INT DEFAULT 0
);

-- Tabela de Livros
CREATE TABLE livros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255) NOT NULL,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  categoria VARCHAR(100),
  disponivel TINYINT(1) DEFAULT 1
);

-- Tabela de Empréstimos (Relacionamento)
CREATE TABLE emprestimos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_aluno INT NOT NULL,
  id_livro INT NOT NULL,
  data_retirada DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_devolucao DATETIME NULL,
  status VARCHAR(20) DEFAULT 'ativo',
  FOREIGN KEY (id_aluno) REFERENCES alunos(id),
  FOREIGN KEY (id_livro) REFERENCES livros(id)
);

-- Dados iniciais de teste (Opcional)
INSERT INTO livros (titulo, autor, codigo, categoria) VALUES 
('Engenharia de Software', 'Pressman', 'TEC001', 'Tecnologia'),
('Dom Quixote', 'Cervantes', 'LIT001', 'Literatura');