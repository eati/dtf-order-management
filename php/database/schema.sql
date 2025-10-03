-- DTF Order Management - MySQL Database Schema
-- mhosting.hu kompatibilis

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- Ügyfelek tábla
-- ============================================
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  
  -- Számlázási adatok
  `billing_name` VARCHAR(255) NOT NULL,
  `billing_zip` VARCHAR(20) NOT NULL,
  `billing_city` VARCHAR(100) NOT NULL,
  `billing_address` VARCHAR(255) NOT NULL,
  
  -- Cég adatok (opcionális)
  `company_name` VARCHAR(255) NULL DEFAULT NULL,
  `tax_number` VARCHAR(50) NULL DEFAULT NULL,
  
  -- Szállítási adatok (opcionális)
  `shipping_name` VARCHAR(255) NULL DEFAULT NULL,
  `shipping_zip` VARCHAR(20) NULL DEFAULT NULL,
  `shipping_city` VARCHAR(100) NULL DEFAULT NULL,
  `shipping_address` VARCHAR(255) NULL DEFAULT NULL,
  
  `note` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Rendelések tábla
-- ============================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `customer_id` INT(11) UNSIGNED NOT NULL,
  
  -- Méretek
  `width_mm` INT(11) NOT NULL DEFAULT 300,
  `length_mm` INT(11) NOT NULL,
  `square_meters` DECIMAL(10,2) NOT NULL,
  
  -- Árazás
  `product_net_price` DECIMAL(10,2) NOT NULL,
  `product_vat` DECIMAL(10,2) NOT NULL,
  `shipping_net_price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `shipping_vat` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `cod_net_price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `cod_vat` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `total_net` DECIMAL(10,2) NOT NULL,
  `total_vat` DECIMAL(10,2) NOT NULL,
  `total_gross` DECIMAL(10,2) NOT NULL,
  
  -- Rendelés adatok
  `description` TEXT NULL DEFAULT NULL,
  `shipping_method` ENUM('személyes', 'gls') NOT NULL,
  `shipping_address` TEXT NULL DEFAULT NULL,
  `payment_method` ENUM('előre_utalás', 'személyes_átvétel', 'utánvét', 'utalás', 'havi_elszámolás') NOT NULL,
  `payment_date` DATETIME NULL DEFAULT NULL,
  
  -- GLS adatok
  `gls_parcel_number` VARCHAR(100) NULL DEFAULT NULL,
  `gls_label_url` TEXT NULL DEFAULT NULL,
  `gls_status` VARCHAR(100) NULL DEFAULT NULL,
  `gls_tracking_url` TEXT NULL DEFAULT NULL,
  
  -- Státuszok
  `order_status` ENUM('új', 'gyártásban', 'kész', 'kiszállítva', 'lezárva') NOT NULL DEFAULT 'új',
  `payment_status` ENUM('nem_fizetve', 'fizetve', 'részben_fizetve') NOT NULL DEFAULT 'nem_fizetve',
  `invoice_status` ENUM('nincs_számla', 'kiállítva', 'sztornózva') NOT NULL DEFAULT 'nincs_számla',
  `invoice_number` VARCHAR(100) NULL DEFAULT NULL,
  
  `deadline` DATETIME NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_number` (`order_number`),
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_order_status` (`order_status`),
  INDEX `idx_payment_status` (`payment_status`),
  INDEX `idx_invoice_status` (`invoice_status`),
  INDEX `idx_created_at` (`created_at`),
  
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Árazás tábla
-- ============================================
CREATE TABLE IF NOT EXISTS `pricing` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `price_per_sqm` DECIMAL(10,2) NOT NULL DEFAULT 6800.00,
  `vat_rate` DECIMAL(5,2) NOT NULL DEFAULT 27.00,
  `gls_price` DECIMAL(10,2) NOT NULL DEFAULT 1490.00,
  `cod_price` DECIMAL(10,2) NOT NULL DEFAULT 600.00,
  `valid_from` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_valid_from` (`valid_from`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Alapértelmezett árazás beszúrása
-- ============================================
INSERT INTO `pricing` (`price_per_sqm`, `vat_rate`, `gls_price`, `cod_price`, `valid_from`) 
VALUES (6800.00, 27.00, 1490.00, 600.00, NOW())
ON DUPLICATE KEY UPDATE `id` = `id`;

SET FOREIGN_KEY_CHECKS = 1;
