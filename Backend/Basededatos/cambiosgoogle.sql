
USE neurologic_db;

-- Permitir usuarios sin contraseña local
ALTER TABLE usuarios
MODIFY COLUMN password_hash VARCHAR(255) NULL;

-- Identificador único de Google
ALTER TABLE usuarios
ADD COLUMN google_id VARCHAR(255) NULL UNIQUE
AFTER correo;

-- Verificar estructura
DESCRIBE usuarios;
