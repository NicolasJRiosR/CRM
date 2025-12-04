-- Crear base de datos
CREATE DATABASE IF NOT EXISTS crmdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE crmdb;

-- Tabla de usuarios (para login con Spring Security)
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    enabled TINYINT DEFAULT 1
);

-- Roles de usuario
CREATE TABLE roles (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE
);

-- Relación usuarios-roles
CREATE TABLE users_roles (
    user_id BIGINT UNSIGNED NOT NULL,
    role_id SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Clientes
CREATE TABLE cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL,
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Proveedores
CREATE TABLE proveedor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20)
);
-- Productos
CREATE TABLE producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    stock INT DEFAULT 0,
    precio DECIMAL(10,2) NOT NULL,
    proveedor_id INT,
    FOREIGN KEY (proveedor_id) REFERENCES proveedor(id)
);
-- Compras
CREATE TABLE compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proveedor_id INT NOT NULL,
    producto_id INT NOT NULL,
    fecha DATE DEFAULT (CURRENT_DATE),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES producto(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedor(id));
-- Ventas
CREATE TABLE venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    producto_id INT NOT NULL,
    fecha DATE DEFAULT (CURRENT_DATE),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES producto(id),
    FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);

-- Interacciones con clientes
CREATE TABLE interaccion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    tipo VARCHAR(30) NOT NULL, -- email, llamada, reunión
    descripcion VARCHAR(500),
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);
