-- =======================================================
-- 0. CONFIGURAÇÕES (Desativa travas de segurança)
-- =======================================================
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET SQL_SAFE_UPDATES = 0;

-- =======================================================
-- 1. RESET DO BANCO DE DADOS
-- =======================================================
DROP DATABASE IF EXISTS biblioteca_db;
CREATE DATABASE biblioteca_db;
USE biblioteca_db;

-- =======================================================
-- 2. CRIAÇÃO DAS TABELAS
-- =======================================================

CREATE TABLE alunos (
    id INT PRIMARY KEY, -- Removi AUTO_INCREMENT para fixarmos os IDs manualmente
    ra VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    pontuacao INT DEFAULT 0,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE livros (
    id INT PRIMARY KEY, -- IDs fixos para os livros também
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    categoria VARCHAR(100),
    disponivel TINYINT(1) DEFAULT 1
);

CREATE TABLE emprestimos (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Aqui mantemos automático
    id_aluno INT NOT NULL,
    id_livro INT NOT NULL,
    data_retirada DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_devolucao DATETIME NULL,
    status VARCHAR(20) DEFAULT 'ativo',
    FOREIGN KEY (id_aluno) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_livro) REFERENCES livros(id) ON DELETE CASCADE
);

-- =======================================================
-- 3. INSERINDO ALUNOS (COM IDs FIXOS)
-- =======================================================
INSERT INTO alunos (id, ra, nome, email, telefone, pontuacao) VALUES 
(1, '2023001', 'Lucas Silva', 'lucas@uni.edu', '11999990001', 50),
(2, '2023002', 'Beatriz Costa', 'bia@uni.edu', '11999990002', 30),
(3, '2023003', 'João Pereira', 'joao@uni.edu', '11999990003', 10),
(4, '2023004', 'Mariana Santos', 'mari@uni.edu', '11999990004', 0),
(5, '2023005', 'Pedro Oliveira', 'pedro@uni.edu', '11999990005', 0);

-- Se precisarmos adicionar mais alunos depois, alteramos a tabela para voltar a ser automática:
ALTER TABLE alunos MODIFY id INT AUTO_INCREMENT;
ALTER TABLE alunos AUTO_INCREMENT = 6;

-- =======================================================
-- 4. INSERINDO LIVROS
-- =======================================================
INSERT INTO livros (id, titulo, autor, codigo, categoria, disponivel) VALUES
(1, 'Engenharia de Software', 'Roger Pressman', 'TEC-001', 'Tecnologia', 1),
(2, 'Clean Code', 'Robert C. Martin', 'TEC-002', 'Tecnologia', 1),
(3, 'Estruturas de Dados', 'Loiane Groner', 'TEC-003', 'Tecnologia', 1),
(4, 'Dom Quixote', 'Miguel de Cervantes', 'LIT-101', 'Literatura', 1),
(26, 'Inteligência Artificial', 'Peter Norvig', 'TEC-006', 'Tecnologia', 1),
(27, 'Sistemas Operacionais Modernos', 'Andrew S. Tanenbaum', 'TEC-007', 'Tecnologia', 1),
(28, 'Segurança de Redes', 'William Stallings', 'TEC-008', 'Tecnologia', 0),
(29, 'Patterns of Enterprise Application', 'Martin Fowler', 'TEC-009', 'Tecnologia', 1),
(31, 'O Mal-Estar na Civilização', 'Sigmund Freud', 'PSI-601', 'Psicologia', 1),
(33, 'Pedagogia do Oprimido', 'Paulo Freire', 'PED-603', 'Pedagogia', 0),
(36, 'A História da Arte', 'E.H. Gombrich', 'ART-701', 'Artes', 1),
(41, 'Direito Penal: Parte Geral', 'Rogério Greco', 'HUM-206', 'Direito', 1),
(46, 'Cálculo - Volume 2', 'James Stewart', 'EXA-106', 'Matemática', 1),
(51, 'Dom Casmurro', 'Machado de Assis', 'LIT-501', 'Literatura', 1),
(53, 'A Hora da Estrela', 'Clarice Lispector', 'LIT-503', 'Literatura', 1);

-- Se precisarmos adicionar mais livros depois:
ALTER TABLE livros MODIFY id INT AUTO_INCREMENT;
ALTER TABLE livros AUTO_INCREMENT = 100;

-- =======================================================
-- 5. HISTÓRICO DE EMPRÉSTIMOS
-- =======================================================

-- Lucas (ID 1)
INSERT INTO emprestimos (id_aluno, id_livro, data_retirada, data_devolucao, status) VALUES
(1, 1, '2025-05-10 14:00:00', '2025-05-20 10:00:00', 'devolvido'),
(1, 26, '2025-06-05 09:00:00', '2025-06-15 11:00:00', 'devolvido'),
(1, 31, '2025-07-20 16:00:00', '2025-07-25 09:00:00', 'devolvido'),
(1, 51, '2025-09-10 13:00:00', '2025-09-15 14:00:00', 'devolvido'),
(1, 36, '2025-10-05 10:00:00', '2025-10-20 16:00:00', 'devolvido');

-- Beatriz (ID 2)
INSERT INTO emprestimos (id_aluno, id_livro, data_retirada, data_devolucao, status) VALUES
(2, 53, '2025-06-12 11:00:00', '2025-06-18 10:00:00', 'devolvido'),
(2, 41, '2025-08-15 15:00:00', '2025-08-25 12:00:00', 'devolvido'),
(2, 29, '2025-10-01 09:00:00', '2025-10-10 11:00:00', 'devolvido');

-- João (ID 3)
INSERT INTO emprestimos (id_aluno, id_livro, data_retirada, data_devolucao, status) VALUES
(3, 2, '2025-09-01 08:00:00', '2025-09-30 17:00:00', 'devolvido');

-- Empréstimos Ativos (Mariana ID 4 e Pedro ID 5)
INSERT INTO emprestimos (id_aluno, id_livro, data_retirada, data_devolucao, status) VALUES
(4, 28, NOW(), NULL, 'ativo'),
(5, 33, NOW(), NULL, 'ativo');

-- Atualiza status dos livros emprestados
UPDATE livros SET disponivel = 0 WHERE id IN (28, 33);

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

SELECT '✅ Banco corrigido e populado com sucesso!' AS Status;

USE biblioteca_db;

-- 1. Garante que a Beatriz (ID 2) existe no banco
INSERT IGNORE INTO alunos (id, ra, nome, email, telefone, pontuacao) 
VALUES (2, '2023002', 'Beatriz Costa', 'bia.costa@uni.edu.br', '11999990002', 30);

-- 2. Tenta inserir o histórico dela novamente
INSERT INTO emprestimos (id_aluno, id_livro, data_retirada, data_devolucao, status) VALUES
(2, 53, '2025-06-12 11:00:00', '2025-06-18 10:00:00', 'devolvido'),
(2, 41, '2025-08-15 15:00:00', '2025-08-25 12:00:00', 'devolvido'),
(2, 29, '2025-10-01 09:00:00', '2025-10-10 11:00:00', 'devolvido');
SELECT 
    a.nome, 
    a.ra,
    COUNT(e.id) as livros_lidos 
FROM alunos a
JOIN emprestimos e ON a.id = e.id_aluno
WHERE e.status = 'devolvido'
GROUP BY a.id
ORDER BY livros_lidos DESC;

USE biblioteca_db;

-- 1. Reativa o AUTO_INCREMENT para ALUNOS
-- O sistema vai olhar que paramos no ID 5 e o próximo será o 6 automaticamente
ALTER TABLE alunos MODIFY id INT AUTO_INCREMENT;
ALTER TABLE alunos AUTO_INCREMENT = 6;

-- 2. Reativa o AUTO_INCREMENT para LIVROS (caso o professor cadastre livros também)
-- Como inserimos IDs altos manuais, garantimos que o próximo seja sequencial
ALTER TABLE livros MODIFY id INT AUTO_INCREMENT;

-- 3. Confirmação
SELECT '✅ Sistema pronto para cadastros automáticos!' AS Status;

USE biblioteca_db;

-- 1. Renomeia a coluna ISBN para CODIGO (se já existir isbn)
ALTER TABLE livro CHANGE COLUMN isbn codigo VARCHAR(20) UNIQUE;

-- OU, se a tabela estiver vazia/nova, garanta que ela tenha essa estrutura:
-- CREATE TABLE livro (
--    id_livro INT AUTO_INCREMENT PRIMARY KEY,
--    titulo VARCHAR(255),
--    autor VARCHAR(100),
--    codigo VARCHAR(20) UNIQUE,
--    categoria VARCHAR(50),
--    disponivel BOOLEAN DEFAULT 1
-- );

-- 2. Garante que a coluna 'disponivel' existe
ALTER TABLE livro ADD COLUMN disponivel BOOLEAN DEFAULT 1;

-- 3. Atualiza FK da tabela emprestimo (caso ainda esteja usando id_exemplar)
ALTER TABLE emprestimo CHANGE COLUMN id_exemplar id_livro INT NOT NULL;
