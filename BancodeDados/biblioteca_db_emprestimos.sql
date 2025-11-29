-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: biblioteca_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `emprestimos`
--

DROP TABLE IF EXISTS `emprestimos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emprestimos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_aluno` int NOT NULL,
  `id_livro` int NOT NULL,
  `data_retirada` datetime DEFAULT CURRENT_TIMESTAMP,
  `data_devolucao` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT 'ativo',
  PRIMARY KEY (`id`),
  KEY `id_aluno` (`id_aluno`),
  KEY `id_livro` (`id_livro`),
  CONSTRAINT `emprestimos_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `alunos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `emprestimos_ibfk_2` FOREIGN KEY (`id_livro`) REFERENCES `livros` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emprestimos`
--

LOCK TABLES `emprestimos` WRITE;
/*!40000 ALTER TABLE `emprestimos` DISABLE KEYS */;
INSERT INTO `emprestimos` VALUES (1,1,1,'2025-05-10 14:00:00','2025-05-20 10:00:00','devolvido'),(2,1,26,'2025-06-05 09:00:00','2025-06-15 11:00:00','devolvido'),(3,1,31,'2025-07-20 16:00:00','2025-07-25 09:00:00','devolvido'),(4,1,51,'2025-09-10 13:00:00','2025-09-15 14:00:00','devolvido'),(5,1,36,'2025-10-05 10:00:00','2025-10-20 16:00:00','devolvido'),(6,2,53,'2025-06-12 11:00:00','2025-06-18 10:00:00','devolvido'),(7,2,41,'2025-08-15 15:00:00','2025-08-25 12:00:00','devolvido'),(8,2,29,'2025-10-01 09:00:00','2025-10-10 11:00:00','devolvido'),(9,3,2,'2025-09-01 08:00:00','2025-09-30 17:00:00','devolvido'),(10,4,28,'2025-11-27 23:13:38',NULL,'ativo'),(11,5,33,'2025-11-27 23:13:38',NULL,'ativo'),(12,2,53,'2025-06-12 11:00:00','2025-06-18 10:00:00','devolvido'),(13,2,41,'2025-08-15 15:00:00','2025-08-25 12:00:00','devolvido'),(14,2,29,'2025-10-01 09:00:00','2025-10-10 11:00:00','devolvido');
/*!40000 ALTER TABLE `emprestimos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-29  9:29:31
