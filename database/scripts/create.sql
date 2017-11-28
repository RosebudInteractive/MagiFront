CREATE TABLE IF NOT EXISTS `episode` (
  `episode_id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(2000) NOT NULL,
  `active` TINYINT(4) NOT NULL DEFAULT b'0',
  `created` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`episode_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
