-- MySQL dump 10.13  Distrib 8.0.20, for Linux (x86_64)
--
-- Host: localhost    Database: anysensor_new
-- ------------------------------------------------------
-- Server version	8.0.20-0ubuntu0.19.10.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `zoneId` int NOT NULL AUTO_INCREMENT,
  `location1` varchar(25) DEFAULT NULL,
  `location2` varchar(25) DEFAULT NULL,
  `location3` varchar(25) DEFAULT NULL,
  `map` varchar(255) DEFAULT NULL,
  `createdBy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`zoneId`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (30,'Bucuresti','Sector 1','Cora Pantelimon','./public/images/custom-maps/1607083867217_descarcare3.jpeg','Dasstec B2B'),(32,'Cluj','Centru','Headquarter dasstec',NULL,'COMPANY SRL'),(33,'Bucuresti','Sector 1','Depozit dasstec','./public/images/custom-maps/1607005508980_cora_sketch.jpeg','Dasstec B2B'),(39,'Bucuresti','Sector 1','Etaj 1','./public/images/custom-maps/1606140314789_descarcare3.jpeg','Dasstec B2B'),(40,'Bucuresti','Sector 1','Locatie0','./public/images/custom-maps/1604481724855_descarcare3.jpeg','Dasstec B2B'),(43,'Bucuresti','Sector 1','Location2','./public/images/custom-maps/1604574951378_descarcare3.jpeg','Dasstec B2B'),(48,'Dambovita','Targoviste','Locatie1','./public/images/custom-maps/1604568014674_descarcare3.jpeg','Cora SRL'),(50,'Bucuresti','Sector 1','Magazin','./public/images/custom-maps/1604580735078_descarcare3.jpeg','Compania mea SRL'),(51,'Bihor','Oradea','Depozit','custom','Compania Mea'),(52,'Bucuresti','Sector 2','Acasa','ol','Dasstec B2B'),(53,'Sector 3','Bucuresti','Cora',NULL,'dasstec'),(54,'Bucuresti','Sector 2','Depozit',NULL,'Cora SRL'),(55,'Bucuresti','Sector 6','Depozit',NULL,'Dasstec B2B'),(59,'bucuresti','usi','pantelimon','./public/images/custom-maps/1608281434533_frigiderepantelimon.jpeg','Cora SA'),(60,'sector 1','bucuresti','cora test',NULL,'dasstec'),(61,'sector 5','bucuresti','cora pantelimon',NULL,'dasstec'),(63,'Bucuresti','Frigidere','Pantelimon','./public/images/custom-maps/cora_sketch2.png','Cora SA'),(64,'romania','bucuresti','Dasstec IoT',NULL,'Perjaru'),(65,'romania','temperatura','acasa',NULL,'Alex'),(66,'dasstec','bucuresti','sector 1',NULL,'Alberto'),(67,'romania','ghermanesti','calugareni nr.34',NULL,'Cristina'),(69,'bucuresti','dasstec','depozit',NULL,'Dasstec B2B'),(70,'bucuresti','Depozit Bucuresti','iConv',NULL,'pharmaFarm'),(71,'bucuresti','depozit','bigotti',NULL,'bigotti');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sensors`
--

DROP TABLE IF EXISTS `sensors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sensors` (
  `sensorId` varchar(25) NOT NULL,
  `sensorType` varchar(25) NOT NULL,
  `min` int DEFAULT NULL,
  `max` int DEFAULT NULL,
  `offset` int DEFAULT NULL,
  `x` varchar(32) DEFAULT NULL,
  `y` varchar(32) DEFAULT NULL,
  `sensorName` varchar(25) DEFAULT NULL,
  `zoneId` int DEFAULT '1',
  `alerts` int DEFAULT '0',
  `battery` int DEFAULT '0',
  `openTimer` int DEFAULT '0',
  `closedTimer` int DEFAULT '0',
  `status` varchar(255) DEFAULT NULL,
  `statusTime` timestamp NULL DEFAULT NULL,
  `usageToday` int DEFAULT NULL,
  `usageTotal` int DEFAULT NULL,
  `service` int DEFAULT NULL,
  `serviceCycle` int DEFAULT NULL,
  `safety` int DEFAULT '0',
  PRIMARY KEY (`sensorId`),
  UNIQUE KEY `sensorId` (`sensorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sensors`
--

LOCK TABLES `sensors` WRITE;
/*!40000 ALTER TABLE `sensors` DISABLE KEYS */;
INSERT INTO `sensors` VALUES ('API0001T','temperature',NULL,NULL,NULL,NULL,NULL,'api',65,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('BIG001CONV','conveyor',NULL,NULL,NULL,NULL,NULL,'main',71,0,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('BIG001SEG','segment',NULL,NULL,NULL,NULL,NULL,'seg 1',71,0,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('BIG002SEG','segment',NULL,NULL,NULL,NULL,NULL,'seg 2',71,0,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('BIG003SEG','segment',NULL,NULL,NULL,NULL,NULL,'seg 3',71,0,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('BIG004SEG','segment',NULL,NULL,NULL,NULL,NULL,'seg 4',71,0,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('BIG005SEG','segment',NULL,NULL,NULL,NULL,NULL,'seg 5',71,0,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('BIG006SEG','segment',NULL,NULL,NULL,NULL,NULL,'seg 6',71,0,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('BIG007SEG','segment',NULL,NULL,NULL,NULL,NULL,'seg 7',71,0,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0001T','temperature',NULL,NULL,NULL,'512','857','Bac 41',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0002T','temperature',NULL,NULL,NULL,'524','460','Bac 3',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0006T','temperature',NULL,NULL,NULL,'367','131','Bac 23',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0007T','temperature',NULL,NULL,NULL,'785','405','Bac 17',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0008T','temperature',NULL,NULL,NULL,'602','880','Bac 40',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0009T','temperature',NULL,NULL,NULL,'784','466','Bac 12',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0010T','temperature',NULL,NULL,NULL,'774','889','Bac 36',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0011T','temperature',NULL,NULL,NULL,'626','461','Bac 7',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0012T','temperature',NULL,NULL,NULL,'672','485','Bac 9',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0015T','temperature',NULL,NULL,NULL,'787','571','Bac 16',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0020T','temperature',NULL,NULL,NULL,'604','855','Bac 39',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0021T','temperature',NULL,NULL,NULL,'290','131','Bac 20',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0022T','temperature',NULL,NULL,NULL,'575','510','Bac 6',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0023T','temperature',NULL,NULL,NULL,'855','863','Bac 30',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0024T','temperature',NULL,NULL,NULL,'429','161','Bac 26',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0025T','temperature',1,8,NULL,'473','460','bac 1',63,0,1,NULL,NULL,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0029T','temperature',NULL,NULL,NULL,'575','459','Bac 5',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0030T','temperature',NULL,NULL,NULL,'786','514','Bac 13',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0032T','temperature',NULL,NULL,NULL,'691','151','Bac 27',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0033T','temperature',NULL,NULL,NULL,'688','849','Bac 37',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0034T','temperature',NULL,NULL,NULL,'807','134','Bac 28',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0037T','temperature',NULL,NULL,NULL,'856','890','Bac 32',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0039T','temperature',NULL,NULL,NULL,'413','884','Bac 44',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0041T','temperature',NULL,NULL,NULL,'776','839','Bac 34',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0042T','temperature',NULL,NULL,NULL,'851','514','Bac 18',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0044T','temperature',NULL,NULL,NULL,'435','132','Bac 25',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0045T','temperature',NULL,NULL,NULL,'784','435','Bac 15',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0046T','temperature',NULL,NULL,NULL,'722','511','Bac 11',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0047T','temperature',NULL,NULL,NULL,'290','163','Bac 21',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0048T','temperature',NULL,NULL,NULL,'723','463','Bac 10',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0049T','temperature',NULL,NULL,NULL,'361','160','Bac 24',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0052T','temperature',NULL,NULL,NULL,'690','177','Bac 29',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0054T','temperature',NULL,NULL,NULL,'850','467','Bac 19',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0057T','temperature',NULL,NULL,NULL,'686','875','Bac 38',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0058T','temperature',NULL,NULL,NULL,'787','543','Bac 14',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0060T','temperature',NULL,NULL,NULL,'418','857','Bac 43',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0061T','temperature',NULL,NULL,NULL,'774','865','Bac 35',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0062T','temperature',NULL,NULL,NULL,'509','884','Bac 42',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0065T','temperature',NULL,NULL,NULL,'854','838','Bac 33',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0069T','temperature',NULL,NULL,NULL,'523','511','Bac 4',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0073T','temperature',NULL,NULL,NULL,'469','510','Bac 2',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0077T','temperature',NULL,NULL,NULL,'626','509','Bac 8',63,0,1,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0),('CORA0079D','door',NULL,NULL,NULL,'1471','227','usa 21',59,0,0,180,NULL,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0081D','door',NULL,NULL,NULL,NULL,NULL,'usa 15',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0083D','door',NULL,NULL,NULL,NULL,NULL,'usa 20',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0086D','door',NULL,NULL,NULL,'585','316','usa 10',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0088D','door',NULL,NULL,NULL,'1010','54','usa 16',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0091D','door',NULL,NULL,NULL,NULL,NULL,'usa 19',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0092D','door',NULL,NULL,NULL,NULL,NULL,'usa 18',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0093D','door',NULL,NULL,NULL,'1462','405','usa 23',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0095D','door',NULL,NULL,NULL,'1291','459','usa 22',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0096D','door',NULL,NULL,NULL,NULL,NULL,'usa 17',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0097D','door',NULL,NULL,NULL,NULL,NULL,'usa 14',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0098D','door',NULL,NULL,NULL,NULL,NULL,'usa 7',59,0,0,-1,NULL,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0099D','door',NULL,NULL,NULL,'1010','126','usa 24',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0100D','door',NULL,NULL,NULL,NULL,NULL,'usa 5',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0101D','door',NULL,NULL,NULL,NULL,NULL,'usa 2',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0102D','door',NULL,NULL,NULL,NULL,NULL,'usa 3',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0103D','door',NULL,NULL,NULL,NULL,NULL,'usa 9',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0104D','door',NULL,NULL,NULL,NULL,NULL,'usa 11',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0105D','door',NULL,NULL,NULL,'397','125','usa 4',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0106D','door',NULL,NULL,NULL,NULL,NULL,'usa 1',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('CORA0107D','door',NULL,NULL,NULL,NULL,NULL,'usa 6',59,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS0001T','temperature',NULL,NULL,NULL,NULL,NULL,'sensor',64,3,0,NULL,NULL,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS0002T','temperature',NULL,NULL,NULL,NULL,NULL,'cristina',67,0,0,0,0,'0','2021-01-25 11:51:43',NULL,NULL,NULL,NULL,0),('DAS0003T','temperature',NULL,NULL,NULL,NULL,NULL,'temp',65,3,0,0,0,'0','2021-01-25 11:50:44',NULL,NULL,NULL,NULL,0),('DAS0004T','temperature',NULL,NULL,NULL,NULL,NULL,'alberto',66,3,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS000TTEST','temperature',5,45,NULL,'12','40','frigidertest',60,2,0,NULL,NULL,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS0019TACASA','temperature',2,12,NULL,'289.42657470703125','429.70672607421875','outside',52,0,0,NULL,0,'0','2021-01-25 11:54:22',NULL,NULL,NULL,NULL,0),('DAS001TCORA','temperature',NULL,NULL,NULL,NULL,NULL,'frigider 3',61,0,1,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS0020TACASA','temperature',NULL,NULL,NULL,'287.0123291015625','316.13555908203125','inside',52,0,0,NULL,NULL,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS002TCORA','temperature',10,30,NULL,'567','83','Frigider',33,0,1,NULL,NULL,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS003TCORA','temperature',1,30,10,'362','139','Frigider2',30,1,1,NULL,NULL,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS004TCORA','temperature',NULL,NULL,NULL,'605','81','bucatarie',33,0,1,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS005TCORA','temperature',NULL,NULL,NULL,'300','139','Frigider3',30,3,1,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS006TBIROU','voltage',NULL,NULL,NULL,NULL,NULL,'Magazie',39,0,1,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS007TBIROU','voltage',NULL,NULL,NULL,'646','81','Magazie',33,0,1,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS008TCORA','temperature',NULL,NULL,NULL,'149','253','sensor0',40,0,1,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS009TBIROU','temperature',NULL,NULL,NULL,NULL,NULL,'sensor0',41,0,1,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS010TBIROU','temperature',NULL,NULL,NULL,NULL,NULL,'sensor0',42,0,1,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS011TBIROU','temperature',NULL,NULL,NULL,'379','202','sensor',43,0,1,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS012TCORA','temperature',NULL,NULL,NULL,'179','266','sensor1',48,0,1,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS013TCORA','temperature',NULL,NULL,NULL,'468','227','sensor2',48,0,1,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS014TCOMPANIAMEA','temperature',NULL,NULL,NULL,'149','261','Congelator #123',50,0,1,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS015TCOMPANIAMEA','temperature',NULL,NULL,NULL,'434','208','Conegaltor #124',50,0,1,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS016TDEMO','temperature',NULL,NULL,NULL,'49','61','Frigider #124312',51,0,1,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS017TCORA','temperature',NULL,NULL,NULL,'462','143','sensorTest',30,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS018TCORA','door',NULL,NULL,NULL,'138','144','usa congelator',30,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS019DTEST','door',NULL,NULL,NULL,NULL,NULL,'Frigider',53,0,0,20,NULL,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS020TCORA','door',NULL,NULL,NULL,'405','141','usa depozit',30,0,0,10,NULL,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS021TBIROU','door',NULL,NULL,NULL,NULL,NULL,'usa#1',54,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS022TBIROU','door',NULL,NULL,NULL,NULL,NULL,'usa atelier',55,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS023TBIROU','door',NULL,NULL,NULL,NULL,NULL,'usa intrare',55,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS024TBIROU','door',NULL,NULL,NULL,NULL,NULL,'usa birou',55,0,0,0,0,'0',NULL,NULL,NULL,NULL,NULL,0),('DAS025DTEST','door',NULL,NULL,NULL,NULL,NULL,'Frigider1',53,0,0,35,NULL,'0',NULL,NULL,NULL,NULL,NULL,0),('PHARMA0001CONV','conveyor',NULL,NULL,NULL,NULL,NULL,'conveyor',70,0,0,0,0,'1','2021-02-11 12:26:26',0,651339,NULL,NULL,0),('PHARMA0001GATE','gate',NULL,NULL,NULL,'1485','335','Gate',70,0,0,0,0,'close','2021-02-11 15:03:48',11,1783,NULL,NULL,0),('PHARMA0001SEG','segment',NULL,NULL,NULL,'485','70','Seg acumulare',70,0,0,0,0,'energy','2021-02-11 15:02:49',516,191581,NULL,NULL,0),('test0002conv','conveyor',NULL,NULL,NULL,NULL,NULL,'conveyor',69,0,0,0,0,'0',NULL,0,2224,NULL,NULL,0),('test002conv001seg','segment',NULL,NULL,NULL,'540','215','seg 1',69,0,0,0,0,'0',NULL,0,NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `sensors` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`alex.barbu`@`%`*/ /*!50003 TRIGGER `statusTimeTrigger` BEFORE UPDATE ON `sensors` FOR EACH ROW BEGIN
IF (NEW.status <> OLD.status) THEN
   set new.statusTime = now();
END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `userAccess`
--

DROP TABLE IF EXISTS `userAccess`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userAccess` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sensorId` varchar(25) DEFAULT NULL,
  `username` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sensorId` (`sensorId`),
  KEY `username` (`username`),
  CONSTRAINT `userAccess_ibfk_1` FOREIGN KEY (`sensorId`) REFERENCES `sensors` (`sensorId`),
  CONSTRAINT `userAccess_ibfk_2` FOREIGN KEY (`username`) REFERENCES `users` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=971 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userAccess`
--

LOCK TABLES `userAccess` WRITE;
/*!40000 ALTER TABLE `userAccess` DISABLE KEYS */;
INSERT INTO `userAccess` VALUES (356,'DAS013TCORA','cora.user2'),(382,'DAS014TCOMPANIAMEA','administrator.test'),(383,'DAS015TCOMPANIAMEA','administrator.test'),(473,'DAS019DTEST','alexandra.paraschiv'),(475,'DAS021TBIROU','cora.user'),(527,'DAS022TBIROU','alex.barbu2'),(528,'DAS023TBIROU','alex.barbu2'),(529,'DAS024TBIROU','alex.barbu2'),(530,'DAS022TBIROU','cora.demo'),(531,'DAS023TBIROU','cora.demo'),(532,'DAS024TBIROU','cora.demo'),(545,'DAS0019TACASA','alex.barbu2'),(546,'DAS0019TACASA','alex.barbu3'),(547,'DAS025DTEST','alexandra.paraschiv'),(590,'DAS0020TACASA','alex.barbu'),(731,'DAS003TCORA','albert.stoian'),(732,'DAS005TCORA','albert.stoian'),(733,'DAS017TCORA','albert.stoian'),(734,'DAS018TCORA','albert.stoian'),(735,'DAS020TCORA','albert.stoian'),(744,'DAS000TTEST','alexandra.paraschiv'),(773,'DAS001TCORA','alexandra.paraschiv'),(865,'CORA0025T','daniel.tudose'),(866,'CORA0079D','daniel.tudose'),(867,'CORA0081D','daniel.tudose'),(868,'CORA0083D','daniel.tudose'),(869,'CORA0086D','daniel.tudose'),(870,'CORA0088D','daniel.tudose'),(871,'CORA0091D','daniel.tudose'),(872,'CORA0092D','daniel.tudose'),(873,'CORA0093D','daniel.tudose'),(874,'CORA0095D','daniel.tudose'),(875,'CORA0096D','daniel.tudose'),(876,'CORA0097D','daniel.tudose'),(877,'CORA0098D','daniel.tudose'),(878,'CORA0099D','daniel.tudose'),(879,'CORA0100D','daniel.tudose'),(880,'CORA0101D','daniel.tudose'),(881,'CORA0102D','daniel.tudose'),(882,'CORA0103D','daniel.tudose'),(883,'CORA0104D','daniel.tudose'),(884,'CORA0105D','daniel.tudose'),(885,'CORA0106D','daniel.tudose'),(886,'CORA0107D','daniel.tudose'),(887,'CORA0079D','idanciu'),(888,'CORA0081D','idanciu'),(889,'CORA0083D','idanciu'),(890,'CORA0086D','idanciu'),(891,'CORA0088D','idanciu'),(892,'CORA0091D','idanciu'),(893,'CORA0092D','idanciu'),(894,'CORA0093D','idanciu'),(895,'CORA0095D','idanciu'),(896,'CORA0096D','idanciu'),(897,'CORA0097D','idanciu'),(898,'CORA0098D','idanciu'),(899,'CORA0099D','idanciu'),(900,'CORA0100D','idanciu'),(901,'CORA0101D','idanciu'),(902,'CORA0102D','idanciu'),(903,'CORA0103D','idanciu'),(904,'CORA0104D','idanciu'),(905,'CORA0105D','idanciu'),(906,'CORA0106D','idanciu'),(907,'CORA0107D','idanciu'),(908,'DAS0001T','marius.perjaru'),(909,'DAS0003T','barbu.alex'),(910,'DAS0004T','alberto.rinaldi'),(911,'API0001T','barbu.alex'),(912,'DAS0002T','cristina.andrei'),(914,'test0002conv','alex.barbu'),(915,'test002conv001seg','alex.barbu'),(916,'PHARMA0001CONV','pharmaFarm'),(917,'PHARMA0001SEG','pharmaFarm'),(918,'PHARMA0001GATE','pharmaFarm'),(919,'CORA0073T','idanciu'),(920,'CORA0002T','idanciu'),(921,'CORA0069T','idanciu'),(922,'CORA0029T','idanciu'),(923,'CORA0022T','idanciu'),(924,'CORA0011T','idanciu'),(925,'CORA0077T','idanciu'),(926,'CORA0012T','idanciu'),(927,'CORA0048T','idanciu'),(928,'CORA0046T','idanciu'),(929,'CORA0009T','idanciu'),(930,'CORA0030T','idanciu'),(931,'CORA0058T','idanciu'),(932,'CORA0045T','idanciu'),(933,'CORA0007T','idanciu'),(934,'CORA0015T','idanciu'),(935,'CORA0054T','idanciu'),(936,'CORA0042T','idanciu'),(937,'CORA0021T','idanciu'),(938,'CORA0047T','idanciu'),(939,'CORA0006T','idanciu'),(940,'CORA0049T','idanciu'),(941,'CORA0044T','idanciu'),(942,'CORA0024T','idanciu'),(943,'CORA0032T','idanciu'),(944,'CORA0034T','idanciu'),(945,'CORA0052T','idanciu'),(946,'CORA0023T','idanciu'),(947,'CORA0065T','idanciu'),(948,'CORA0037T','idanciu'),(949,'CORA0061T','idanciu'),(950,'CORA0010T','idanciu'),(951,'CORA0041T','idanciu'),(952,'CORA0057T','idanciu'),(953,'CORA0033T','idanciu'),(954,'CORA0020T','idanciu'),(955,'CORA0008T','idanciu'),(956,'CORA0001T','idanciu'),(957,'CORA0062T','idanciu'),(958,'CORA0060T','idanciu'),(959,'CORA0039T','idanciu'),(963,'BIG001CONV','bigotti'),(964,'BIG001SEG','bigotti'),(965,'BIG002SEG','bigotti'),(966,'BIG003SEG','bigotti'),(967,'BIG004SEG','bigotti'),(968,'BIG005SEG','bigotti'),(969,'BIG006SEG','bigotti'),(970,'BIG007SEG','bigotti');
/*!40000 ALTER TABLE `userAccess` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `name` varchar(100) DEFAULT NULL,
  `username` varchar(25) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(25) DEFAULT 'basic',
  `company` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`username`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('Nume Prenume','administrator.test','$2a$10$J34QYHZfJJmRGmoVSGgXN.AmlDegd8C40MN.4BiQizYovrcrqhAQe','admin','Compania mea SRL','adresa@email'),('Albert Stoian','albert.stoian','$2a$10$Tw4wEb0q7JYya7gkinZ61.77ExwaV0RFYqL8pbTg1TURwuoJ0XdqG','admin','Dasstec B2B','albert.stoian@dasstec.ro'),('Alberto Rinaldi','alberto.rinaldi','$2a$10$iBqR3.KdE/X1fE7BDMtB3en4VuYnuTZVVbnepwyNp53XphTJuAKuO','superadmin','Alberto','alberto.rinaldi@dasstec.ro'),('Alex Barbu','alex.barbu','$2a$10$N7neXBTqYIGtHm/KAKCo3.876WYeyGOegWzCD3ncnL.0527.rX9Wq','superadmin','Dasstec B2B','barbualex.tgv@gmail.com'),('Alex Barbu','alex.barbu2','$2a$10$1IiM7jJDr5Al/iQVNFSE/OAZ/HhVVDP8.v/JUTqUHKcXfS3ow8KJC','admin','Dasstec B2B','alex.barbu@dasstec.ro'),('Alex Barbu','alex.barbu3','$2a$10$gY6VdiSWaBHfGaOy19Icv.K3a2DEDGrUERLTco8dw8hYcQ5t153KO','admin','Dasstec B2B','barbualex.tgv@gmail.com'),('Alex Barbu','alex.barbu4','$2a$10$OhOvRpniUFTiUU1cS1j0puS7waDbWp6Fhk9fzUOrVQ5nouZKiIpOm','admin','Dasstec B2B','barbualex.tgv@gmail.com'),('Alexandra Paraschiv','alexandra.paraschiv','$2a$10$s/c6gU7WKJLCvzF82NZOY.90FT53WsuBj4EmWDWdIX42Lb3mqjsEy','superadmin','dasstec','alexandra.paraschiv@dasstec.ro'),('Alex Barbu','barbu.alex','$2a$10$3oylquDH4.2ryoH6EJCb7OnivsToyNT/AnxwwZMU6uTqFFn3du1Ii','superadmin','Alex','barbualex.tgv@gmail.com'),('Bigotti Admin','bigotti','$2a$10$o.6DzQLazCbVUNTZ/jtpMuENANaDjRri4H2/DOPNlREAB5T0xg0Li','superadmin','bigotti','office@bigotti.ro'),('Cristina Mihalcea','cmihalcea','$2a$10$wTM.1ZsKviDcjcVq7ecSmuEDPHpgqMaIOvjEqZv2Oc.xCd88pf6rq','admin','Cora SA','cmihalcea@cora.ro'),('Cora User','cora.demo','$2a$10$ozHhA35h5MBBUls7I1e7keTKKakdCGZtNUzD09ImeC64cGV0EUk9G','admin','Dasstec B2B','cora@demo'),('Cora User','cora.user','$2a$10$Ts6dTtKHvLmltkhYn6exH.OVduMbz.qwF/7HWd2g8Au5BXBZtOJA.','superadmin','Cora SRL','cora@user.ro'),('Cora User 1','cora.user1','$2a$10$g9a1zNFTvGj6yFr3lcpfIOe54tug7YO67WtIELLnmNJSHSyotgF5C','admin','Cora SRL','cora@user.ro'),('Cora User 2','cora.user2','$2a$10$67XgNml9s//6XzeMwunzSu1aqm/PThcCPdE2lHlgi5JZf4bt7sqOi','admin','Cora SRL','cora@user.ro'),('Cristina Andrei','cristina.andrei','$2a$10$OH5gZpRUgB6I.DLQwOcWEeRqFGp3hXacMmdB1MEPtqqFx/9NYcMEK','superadmin','Cristina','cristina.andrei@dasstec.ro'),('Daniel Tudose','daniel.tudose','$2a$10$quDV.bBsks/JP36hvAxpjuEoukDB0BPHIohLu6FGlkqKhrJpThNcC','admin','Cora SA','dtudose@cora.ro'),('Alex Barbu','demo.alexbarbu','$2a$10$7M6vdYbPeI1Jn/ibqWTVWuht0eeN4AP4eQHXzJXF0jjaW.yBAwqxO','superadmin','Compania Mea','barbualex.tgv@gmail.com'),('Alex Barbu 2','demo.alexbarbu2','$2a$10$yvpjX984imIIOm5fbJMSD.mBzKyyGbxWTeBsdppb63BwkE8klmaTu','admin','Compania Mea','barbualex.tgv@gmail.com'),('Alex Barbu 3','demo.alexbarbu3','$2a$10$7vYwfWeJb.U801U5/pYieONrNrVV4nzxvR2YxNamuGZmyLCJqWHmi','admin','Compania Mea','barbualex.tgv@gmail.com'),('Ema Ciochiu','ema.ciochiu','$2a$10$iIS1m.fQo2ExgvBncgBT0OuT0ywKBzFl03X.ENBtXwAQ8z/Kbn4GO','superadmin','Ema','ema.ciochiu@dasstec.ro'),('Ioan Danciu','idanciu','$2a$10$32ovJRNgqWhVM/hGEsRoBeChlclhHKgNOA4RjomBLOg7UGehIufhu','superadmin','Cora SA','idanciu@cora.ro'),('Marius Perjaru','marius.perjaru','$2a$10$xfAxdMAXEr3JRAe.fydkyOYD7Im4113bxYjWfKJ8yPghozVKRiM12','superadmin','Perjaru','marius.perjaru@dasstec.ro'),('Pharma Farm','pharmaFarm','$2a$10$JkFjlwyPRjnlQSXbyBcHmOiUHo4dm7oFJzPV042lwqIiyuWEs6O3O','superadmin','pharmaFarm','user@pharmaFarm.ro'),('Sandi Paraschiv','sparaschiv','$2a$10$TKoHHReMLoBJsDCHzkZpDuXE4ezqSt1QK2hajLRDacIUcWADIRqqO','admin','Cora SA','sparaschiv@cora.ro'),('Nume Prenume','username.test','$2a$10$ss5nA/yah1pgYSwZV6f/zevIR.ClraZtWvwywB5d7nzxAF/0jnsdS','superadmin','Compania mea SRL','adresa@email'),('Viorel Radulescu','vradulescu','$2a$10$WzSI/gmU19liZ5ztZdrI5uKE5AhWGOTmk8iFSPPcHc7.KgHdpSukS','admin','Cora SA','vradulescu@cora.ro');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-02-11 17:06:59
