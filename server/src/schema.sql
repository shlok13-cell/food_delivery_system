-- ============================================================
-- Food Delivery System — MySQL Schema
-- ============================================================

-- Drop tables in reverse dependency order (for clean re-runs)
DROP TABLE IF EXISTS order_tracking;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS delivery_partners;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;

-- ============================================================
-- USERS
-- Stores all user accounts: customers, restaurant owners,
-- delivery partners, and admins.
-- ============================================================
CREATE TABLE users (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)    NOT NULL,
  email         VARCHAR(255)    NOT NULL,
  phone         VARCHAR(20)     NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,
  role          ENUM(
                  'customer',
                  'restaurant',
                  'delivery',
                  'admin'
                )               NOT NULL DEFAULT 'customer',
  is_active     TINYINT(1)      NOT NULL DEFAULT 1,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- RESTAURANTS
-- One restaurant per user with role='restaurant'.
-- ============================================================
CREATE TABLE restaurants (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED    NOT NULL,
  name          VARCHAR(150)    NOT NULL,
  description   TEXT,
  address       VARCHAR(255)    NOT NULL,
  city          VARCHAR(100)    NOT NULL,
  state         VARCHAR(100)    NOT NULL,
  zip           VARCHAR(20)     NOT NULL,
  phone         VARCHAR(20)     NOT NULL,
  email         VARCHAR(255)    NOT NULL,
  cuisine_type  VARCHAR(100),
  is_active     TINYINT(1)      NOT NULL DEFAULT 1,
  rating        DECIMAL(3, 2)            DEFAULT NULL
                CHECK (rating BETWEEN 0 AND 5),
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_restaurants_user_id (user_id),
  INDEX idx_restaurants_city (city),
  INDEX idx_restaurants_cuisine (cuisine_type),

  CONSTRAINT fk_restaurants_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- MENU ITEMS
-- Items offered by a restaurant.
-- ============================================================
CREATE TABLE menu_items (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  restaurant_id    INT UNSIGNED    NOT NULL,
  name             VARCHAR(150)    NOT NULL,
  description      TEXT,
  price            DECIMAL(10, 2)  NOT NULL CHECK (price >= 0),
  category         VARCHAR(100),
  image_url        VARCHAR(500),
  is_available     TINYINT(1)      NOT NULL DEFAULT 1,
  created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_menu_items_restaurant (restaurant_id),
  INDEX idx_menu_items_category (category),

  CONSTRAINT fk_menu_items_restaurant
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- DELIVERY PARTNERS
-- One delivery partner record per user with role='delivery'.
-- ============================================================
CREATE TABLE delivery_partners (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id           INT UNSIGNED    NOT NULL,
  vehicle_type      ENUM(
                      'bicycle',
                      'motorcycle',
                      'car',
                      'scooter'
                    )               NOT NULL DEFAULT 'motorcycle',
  vehicle_number    VARCHAR(50),
  is_available      TINYINT(1)      NOT NULL DEFAULT 0,
  current_lat       DECIMAL(10, 7),
  current_lng       DECIMAL(10, 7),
  rating            DECIMAL(3, 2)            DEFAULT NULL
                    CHECK (rating BETWEEN 0 AND 5),
  total_deliveries  INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_delivery_partners_user_id (user_id),
  INDEX idx_delivery_partners_available (is_available),

  CONSTRAINT fk_delivery_partners_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- ORDERS
-- Placed by a customer for a specific restaurant.
-- ============================================================
CREATE TABLE orders (
  id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  customer_id         INT UNSIGNED    NOT NULL,
  restaurant_id       INT UNSIGNED    NOT NULL,
  delivery_partner_id INT UNSIGNED             DEFAULT NULL,
  status              ENUM(
                        'pending',
                        'confirmed',
                        'preparing',
                        'ready',
                        'picked_up',
                        'delivered',
                        'cancelled'
                      )               NOT NULL DEFAULT 'pending',
  total_amount        DECIMAL(10, 2)  NOT NULL CHECK (total_amount >= 0),
  delivery_address    VARCHAR(255)    NOT NULL,
  delivery_lat        DECIMAL(10, 7)           DEFAULT NULL,
  delivery_lng        DECIMAL(10, 7)           DEFAULT NULL,
  notes               TEXT,
  created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                      ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_orders_customer (customer_id),
  INDEX idx_orders_restaurant (restaurant_id),
  INDEX idx_orders_delivery_partner (delivery_partner_id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_created_at (created_at),

  CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT fk_orders_restaurant
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT fk_orders_delivery_partner
    FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- ORDER ITEMS
-- Individual menu items within an order (snapshot of price
-- at time of ordering — not a live FK to current menu price).
-- ============================================================
CREATE TABLE order_items (
  id                   INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  order_id             INT UNSIGNED    NOT NULL,
  menu_item_id         INT UNSIGNED    NOT NULL,
  quantity             SMALLINT UNSIGNED NOT NULL DEFAULT 1
                       CHECK (quantity > 0),
  unit_price           DECIMAL(10, 2)  NOT NULL CHECK (unit_price >= 0),
  subtotal             DECIMAL(10, 2)  NOT NULL CHECK (subtotal >= 0),
  special_instructions TEXT,
  created_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_order_items_order (order_id),
  INDEX idx_order_items_menu_item (menu_item_id),

  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT fk_order_items_menu_item
    FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- ORDER TRACKING
-- Real-time location snapshots for an order in transit.
-- ============================================================
CREATE TABLE order_tracking (
  id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  order_id            INT UNSIGNED    NOT NULL,
  delivery_partner_id INT UNSIGNED    NOT NULL,
  lat                 DECIMAL(10, 7)  NOT NULL,
  lng                 DECIMAL(10, 7)  NOT NULL,
  status              ENUM(
                        'picked_up',
                        'in_transit',
                        'nearby',
                        'delivered'
                      )               NOT NULL DEFAULT 'in_transit',
  recorded_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_order_tracking_order (order_id),
  INDEX idx_order_tracking_partner (delivery_partner_id),
  INDEX idx_order_tracking_recorded_at (recorded_at),

  CONSTRAINT fk_order_tracking_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT fk_order_tracking_partner
    FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
