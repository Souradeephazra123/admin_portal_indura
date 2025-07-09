
use hemsida_admin_indura;
CREATE TABLE users (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
     `email` VARCHAR(480),
    `password` VARCHAR(480),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE seo_metadata (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(480) DEFAULT NULL,
  `phone` varchar(480) DEFAULT NULL,
  `facebook` varchar(480) DEFAULT NULL,
  `twitter` varchar(480) DEFAULT NULL,
  `linkedin` varchar(480) DEFAULT NULL,
  `latitude` varchar(480) DEFAULT NULL,
  `longitude` varchar(480) DEFAULT NULL,
  `metadata_id` int NOT NULL,
  `address` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

CREATE TABLE `hero_section_join_us` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` text NOT NULL,
  `image` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE `contact_faq` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `doubt_clearing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image` text NOT NULL,
  `link` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `eligibility_join_us` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eligibility_text` text NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `expert_blogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `link` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `features` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(960) DEFAULT NULL,
  `hero_id` int NOT NULL,
  `description` varchar(960) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

CREATE TABLE `features_join_us` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `hero` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(480) DEFAULT NULL,
  `metadata_id` int NOT NULL,
  `testimonialSection_title` varchar(480) DEFAULT NULL,
  `testimonialSection_description` varchar(480) DEFAULT NULL,
  `subtitle` varchar(480) DEFAULT NULL,
  `join_us_title` varchar(480) DEFAULT NULL,
  `join_us_description` varchar(480) DEFAULT NULL,
  `join_us_qoute` varchar(480) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

CREATE TABLE `hero_buttons_join_us` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hero_id` int NOT NULL,
  `text` varchar(100) NOT NULL,
  `link` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `hero_id` (`hero_id`),
  CONSTRAINT `hero_buttons_join_us_ibfk_1` FOREIGN KEY (`hero_id`) REFERENCES `hero_section_join_us` (`id`) ON DELETE CASCADE
);

CREATE TABLE `hero_section_blog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` text NOT NULL,
  `image` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);



CREATE TABLE `heroSection_buttons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `text` varchar(480) DEFAULT NULL,
  `hero_id` int NOT NULL,
  `link` varchar(480) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

CREATE TABLE `howtojoin_des` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Description` text NOT NULL,
  `howtojoin_title_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `image_hero_home` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_url` text NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `insights_blog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `metadata` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

CREATE TABLE `metadata_keywords` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `keywords_text` varchar(255) DEFAULT NULL,
  `metadata_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

CREATE TABLE `mock_tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `link` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `news_blog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `programs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(960) DEFAULT NULL,
  `hero_id` int NOT NULL,
  `description` varchar(960) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

CREATE TABLE `programs_join_us` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE `revision_tools` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `link` varchar(255) NOT NULL,
  `image` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `selection_process_join_us` (
  `id` int NOT NULL AUTO_INCREMENT,
  `process_text` text NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `social_links_blog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `youtube` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `steps_join_us` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `study_materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `link` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `upcoming_events_blog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `event_date` date NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `ValuesTable` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(960) DEFAULT NULL,
  `whoweare_id` int NOT NULL,
  `description` varchar(960) DEFAULT NULL,
  `image` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

CREATE TABLE `video_lectures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image` text NOT NULL,
  `link` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `whoweare` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `description` text,
  `image` varchar(480) DEFAULT NULL,
  `mission` text,
  `additionalMission` text,
  `metadata_id` int NOT NULL,
  `joinus_title` varchar(960) DEFAULT NULL,
  `joinus_description` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);

CREATE TABLE `whoweare_faculty` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(960) DEFAULT NULL,
  `whoweare_id` int NOT NULL,
  `role` varchar(960) DEFAULT NULL,
  `image` varchar(480) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
);
CREATE TABLE `whoweare_ourApproach` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Title` text NOT NULL,
  `Description` text NOT NULL,
  `image` text NOT NULL,
  PRIMARY KEY (`id`)
);