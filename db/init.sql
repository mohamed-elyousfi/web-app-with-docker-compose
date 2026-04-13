USE testdb;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255) DEFAULT '',
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (name, description, price)
SELECT 'Clavier mécanique', 'Clavier compact pour développeur', 79.90
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Clavier mécanique');

INSERT INTO products (name, description, price)
SELECT 'Souris ergonomique', 'Souris sans fil avec bonne prise en main', 39.50
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Souris ergonomique');

INSERT INTO products (name, description, price)
SELECT 'Ecran 27 pouces', 'Moniteur IPS Full HD', 189.99
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Ecran 27 pouces');
