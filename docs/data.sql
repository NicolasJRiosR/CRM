-- Roles
INSERT INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_USER');

-- Usuario admin
INSERT INTO users (username, password, enabled) VALUES 
('admin', '{bcrypt}$2a$10$7QkzYhYkFfQ9u7hFzZkF9Oq9uFvQkzYhYkFfQ9u7hFzZkF9Oq9uFv', TRUE);
-- Nota: la contraseña encriptada corresponde a "adminpass"

INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- Clientes
INSERT INTO cliente (nombre, email, telefono) VALUES
('Juan Pérez', 'juan@example.com', '600111222'),
('María López', 'maria@example.com', '600333444');

-- Proveedores
INSERT INTO proveedor (nombre, contacto, telefono) VALUES
('Proveedor SA', 'Carlos García', '911223344'),
('Distribuciones SL', 'Ana Torres', '911556677');

-- Productos
INSERT INTO producto (nombre, stock, precio, proveedor_id) VALUES
('Laptop', 10, 1200.00, 1),
('Smartphone', 20, 800.00, 2);

-- Compras
INSERT INTO compra (producto_id, proveedor_id, cantidad, precio_unitario) VALUES
(1, 1, 5, 1100.00),
(2, 2, 10, 750.00);

-- Ventas
INSERT INTO venta (producto_id, cliente_id, cantidad, precio_unitario) VALUES
(1, 1, 1, 1200.00),
(2, 2, 2, 800.00);

-- Interacciones
INSERT INTO interaccion (cliente_id, tipo, descripcion) VALUES
(1, 'email', 'Se envió oferta de laptop'),
(2, 'llamada', 'Cliente interesado en smartphone');
