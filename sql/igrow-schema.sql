-- MySQL-compatible schema for IGROW registration and wallet backend.
-- Use this file with phpMyAdmin or mysql CLI.
-- If your MySQL user does not have permission to create databases, import this file into an existing database.
-- Uncomment the following lines only if you have CREATE DATABASE privileges.

-- CREATE DATABASE IF NOT EXISTS `igrow2026`
--   DEFAULT CHARACTER SET utf8mb4
--   COLLATE utf8mb4_unicode_ci;

-- USE `igrow2026`;

-- Registrations table stores user records created by registration or admin user creation.
CREATE TABLE IF NOT EXISTS `registrations` (
  `id` VARCHAR(32) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL DEFAULT '',
  `email` VARCHAR(255) NOT NULL,
  `address` TEXT NOT NULL,
  `program` VARCHAR(255) NOT NULL DEFAULT '',
  `plan_amount` DECIMAL(13,2) NOT NULL DEFAULT 0,
  `referral_name` VARCHAR(255) NOT NULL DEFAULT '',
  `referral_code` VARCHAR(255) NOT NULL DEFAULT '',
  `password` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `approved_at` DATETIME NULL,
  `rejection_reason` TEXT NOT NULL,
  `wallet_balance` DECIMAL(13,2) NOT NULL DEFAULT 0,
  `commission_balance` DECIMAL(13,2) NOT NULL DEFAULT 0,
  `parent_id` VARCHAR(32) NULL,
  `side` VARCHAR(10) NOT NULL DEFAULT '',
  `left_child_id` VARCHAR(32) NULL,
  `right_child_id` VARCHAR(32) NULL,
  `profile_image` LONGTEXT NULL,
  `id_card_issued` TINYINT(1) NOT NULL DEFAULT 0,
  `id_card_issued_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uix_registrations_email` (`email`),
  KEY `idx_registrations_parent_id` (`parent_id`),
  KEY `idx_registrations_left_child_id` (`left_child_id`),
  KEY `idx_registrations_right_child_id` (`right_child_id`),
  KEY `idx_registrations_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Top-up history table stores wallet credit records, including admin deposits.
CREATE TABLE IF NOT EXISTS `topup_history` (
  `id` VARCHAR(32) NOT NULL,
  `registration_id` VARCHAR(32) NOT NULL,
  `amount` DECIMAL(13,2) NOT NULL,
  `currency` VARCHAR(16) NOT NULL DEFAULT 'USDT',
  `activity_date` DATETIME NOT NULL,
  `source` VARCHAR(255) NOT NULL,
  `note` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_topup_history_registration_id` (`registration_id`),
  CONSTRAINT `fk_topup_history_registration` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recharge requests submitted by users and processed by admins.
CREATE TABLE IF NOT EXISTS `recharge_requests` (
  `id` VARCHAR(32) NOT NULL,
  `user_id` VARCHAR(32) NOT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `user_email` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(13,2) NOT NULL,
  `currency` VARCHAR(16) NOT NULL DEFAULT 'USDT',
  `method` VARCHAR(100) NOT NULL DEFAULT 'Crypto Wallet',
  `note` TEXT NOT NULL,
  `status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `requested_at` DATETIME NOT NULL,
  `approved_by` VARCHAR(255) NULL,
  `approved_at` DATETIME NULL,
  `rejected_by` VARCHAR(255) NULL,
  `rejected_at` DATETIME NULL,
  `rejection_reason` TEXT NOT NULL DEFAULT '',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recharge_requests_user_id` (`user_id`),
  KEY `idx_recharge_requests_status` (`status`),
  CONSTRAINT `fk_recharge_requests_user` FOREIGN KEY (`user_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Site settings table for landing page content managed through the admin site settings API.
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL DEFAULT '',
  `tagline` TEXT NOT NULL,
  `logo_url` VARCHAR(2048) NOT NULL DEFAULT '',
  `footer_text` TEXT NOT NULL,
  `whatsapp_group_url` VARCHAR(2048) NOT NULL DEFAULT '',
  `telegram_group_url` VARCHAR(2048) NOT NULL DEFAULT '',
  `hero_badge` VARCHAR(255) NOT NULL DEFAULT '',
  `hero_heading` VARCHAR(255) NOT NULL DEFAULT '',
  `hero_highlight` VARCHAR(255) NOT NULL DEFAULT '',
  `hero_description` TEXT NOT NULL,
  `hero_primary_cta` VARCHAR(255) NOT NULL DEFAULT '',
  `hero_secondary_cta` VARCHAR(255) NOT NULL DEFAULT '',
  `benefits_label` VARCHAR(255) NOT NULL DEFAULT '',
  `benefits_heading` VARCHAR(255) NOT NULL DEFAULT '',
  `benefits_heading_highlight` VARCHAR(255) NOT NULL DEFAULT '',
  `benefits_description` TEXT NOT NULL,
  `benefits_cta` VARCHAR(255) NOT NULL DEFAULT '',
  `sentiment_label` VARCHAR(255) NOT NULL DEFAULT '',
  `sentiment_heading` VARCHAR(255) NOT NULL DEFAULT '',
  `sentiment_heading_highlight` VARCHAR(255) NOT NULL DEFAULT '',
  `sentiment_description` TEXT NOT NULL,
  `mentor_label` VARCHAR(255) NOT NULL DEFAULT '',
  `mentor_heading` VARCHAR(255) NOT NULL DEFAULT '',
  `mentor_heading_highlight` VARCHAR(255) NOT NULL DEFAULT '',
  `mentor_description` TEXT NOT NULL,
  `mentor_cta` VARCHAR(255) NOT NULL DEFAULT '',
  `programs_label` VARCHAR(255) NOT NULL DEFAULT '',
  `programs_heading` VARCHAR(255) NOT NULL DEFAULT '',
  `programs_heading_highlight` VARCHAR(255) NOT NULL DEFAULT '',
  `programs_description` TEXT NOT NULL,
  `partners_heading` VARCHAR(255) NOT NULL DEFAULT '',
  `reviews_heading` VARCHAR(255) NOT NULL DEFAULT '',
  `reviews_heading_highlight` VARCHAR(255) NOT NULL DEFAULT '',
  `reviews_description` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `site_settings` (
  `title`,
  `tagline`,
  `logo_url`,
  `footer_text`,
  `whatsapp_group_url`,
  `telegram_group_url`,
  `hero_badge`,
  `hero_heading`,
  `hero_highlight`,
  `hero_description`,
  `hero_primary_cta`,
  `hero_secondary_cta`,
  `benefits_label`,
  `benefits_heading`,
  `benefits_heading_highlight`,
  `benefits_description`,
  `benefits_cta`,
  `sentiment_label`,
  `sentiment_heading`,
  `sentiment_heading_highlight`,
  `sentiment_description`,
  `mentor_label`,
  `mentor_heading`,
  `mentor_heading_highlight`,
  `mentor_description`,
  `mentor_cta`,
  `programs_label`,
  `programs_heading`,
  `programs_heading_highlight`,
  `programs_description`,
  `partners_heading`,
  `reviews_heading`,
  `reviews_heading_highlight`,
  `reviews_description`
) VALUES (
  'iGrow 2026',
  'Grow with confidence',
  '/IGROW%20LOGO.png',
  '© iGrow 2026',
  'https://whatsapp.com/channel/igrow-society',
  'https://t.me/igrow-society',
  'Next-Gen Trading Academy',
  'MASTERY OF THE',
  'MARKETS.',
  'iGrow Society bridges the gap between traditional finance and the decentralized future. Experience professional trading education with AI-driven mentorship.',
  'Join The Society',
  'View Catalog',
  'Institute Benefits',
  'More Than Just ',
  'Education.',
  'Master institutional concepts and gain an edge with an ecosystem designed for high-performance trading.',
  'Claim All Benefits',
  'Live Analysis',
  'Global Market ',
  'Sentiment',
  'Our proprietary engine analyzes real-time order flow and institutional positioning to give students the edge in every trade.',
  'AI Reasoning Engine',
  'Find Your Perfect ',
  'Strategy',
  'Tell our AI Mentor about your goals and experience, and we''ll craft the ideal educational path for your success.',
  'Consult AI Mentor',
  'Our Programs',
  'iGrow Learning ',
  'Institute.',
  'Course & Admission Programs designed to transform your financial future.',
  'Institutional Partners & Liquidity',
  'Success ',
  'Stories',
  'Hear from our students who transformed their trading journey through logic and institutional reasoning.'
);

-- Optional future tables for normalized auth and admin user persistence.
CREATE TABLE IF NOT EXISTS `auth_users` (
  `id` VARCHAR(32) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uix_auth_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` VARCHAR(32) NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','editor') NOT NULL DEFAULT 'admin',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uix_admin_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Knowledge base for admin-provided Q&A used by the assistant
CREATE TABLE IF NOT EXISTS `knowledge_base` (
  `id` VARCHAR(64) NOT NULL,
  `question` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_knowledge_question` (`question`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Support chat messages persisted for audit and follow-up
CREATE TABLE IF NOT EXISTS `support_messages` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(32) NULL,
  `from_role` ENUM('user','growi','admin') NOT NULL DEFAULT 'user',
  `message` TEXT NOT NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_support_user` (`user_id`),
  CONSTRAINT `fk_support_user` FOREIGN KEY (`user_id`) REFERENCES `registrations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Market feed cache to reduce provider calls and support UI historical snapshots
CREATE TABLE IF NOT EXISTS `market_feed_cache` (
  `symbol` VARCHAR(16) NOT NULL,
  `provider` VARCHAR(64) NOT NULL,
  `price` DECIMAL(28,8) NOT NULL DEFAULT 0,
  `change_pct_24h` DECIMAL(10,4) NOT NULL DEFAULT 0,
  `market_cap` DECIMAL(20,2) NULL,
  `volume_24h` DECIMAL(20,2) NULL,
  `raw` LONGTEXT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`symbol`),
  KEY `idx_market_feed_provider` (`provider`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments & transactions table for audits beyond topup_history
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(64) NOT NULL,
  `registration_id` VARCHAR(32) NULL,
  `amount` DECIMAL(26,8) NOT NULL,
  `currency` VARCHAR(16) NOT NULL DEFAULT 'USDT',
  `type` ENUM('topup','commission','admin_deposit','payout') NOT NULL,
  `status` ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  `reference` VARCHAR(255) NULL,
  `meta` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_registration` (`registration_id`),
  CONSTRAINT `fk_payments_registration` FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Simple sessions table for issued tokens (if not using JWT stateless tokens)
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(64) NOT NULL,
  `registration_id` VARCHAR(32) NOT NULL,
  `token` VARCHAR(512) NOT NULL,
  `ip` VARCHAR(64) NULL,
  `user_agent` VARCHAR(1024) NULL,
  `expires_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sessions_registration` (`registration_id`),
  CONSTRAINT `fk_sessions_registration` FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: normalized roles table for RBAC expansion
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL UNIQUE,
  `description` TEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_roles` (
  `registration_id` VARCHAR(32) NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`registration_id`,`role_id`),
  KEY `idx_user_roles_role_id` (`role_id`),
  CONSTRAINT `fk_user_roles_registration` FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Small helper table to track issued ID cards and manual admin edits
CREATE TABLE IF NOT EXISTS `id_cards` (
  `id` VARCHAR(64) NOT NULL,
  `registration_id` VARCHAR(32) NOT NULL,
  `data` JSON NOT NULL,
  `issued` TINYINT(1) NOT NULL DEFAULT 0,
  `issued_at` DATETIME NULL,
  `issued_by_admin` VARCHAR(64) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_id_cards_registration` (`registration_id`),
  CONSTRAINT `fk_id_cards_registration` FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add fulltext search index if supported
-- MySQL requires explicit FULLTEXT index creation per engine/version; create if available
-- CREATE FULLTEXT INDEX `ft_knowledge_question_answer` ON `knowledge_base` (`question`, `answer`);

-- End of schema
