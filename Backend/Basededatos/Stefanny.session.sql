USE neurologic_db;

-- 1. Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('estudiante', 'administrador') NOT NULL DEFAULT 'estudiante',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabla de minijuegos
CREATE TABLE IF NOT EXISTS minijuegos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de partidas
CREATE TABLE IF NOT EXISTS partidas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    minijuego_id INT UNSIGNED NOT NULL,
    nivel INT UNSIGNED NOT NULL DEFAULT 1,
    estado ENUM('en_curso', 'completada', 'abandonada')
        NOT NULL DEFAULT 'en_curso',
    puntaje_total INT UNSIGNED NOT NULL DEFAULT 0,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_finalizacion TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (minijuego_id) REFERENCES minijuegos(id),
    INDEX idx_partidas_usuario (usuario_id),
    INDEX idx_partidas_minijuego (minijuego_id)
);

-- 4. Tabla de resultados
CREATE TABLE IF NOT EXISTS resultados (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    partida_id BIGINT UNSIGNED NOT NULL,
    numero_pregunta INT UNSIGNED NOT NULL,
    respuesta_usuario TEXT,
    respuesta_correcta TEXT,
    es_correcta BOOLEAN NOT NULL DEFAULT FALSE,
    puntos_obtenidos INT UNSIGNED NOT NULL DEFAULT 0,
    tiempo_respuesta_segundos DECIMAL(8,2) UNSIGNED,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partida_id) REFERENCES partidas(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_resultado_pregunta (partida_id, numero_pregunta)
);

-- 5. Tabla de progreso
CREATE TABLE IF NOT EXISTS progreso (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    minijuego_id INT UNSIGNED NOT NULL,
    partidas_completadas INT UNSIGNED NOT NULL DEFAULT 0,
    puntaje_acumulado BIGINT UNSIGNED NOT NULL DEFAULT 0,
    mejor_puntaje INT UNSIGNED NOT NULL DEFAULT 0,
    nivel_maximo_alcanzado INT UNSIGNED NOT NULL DEFAULT 1,
    ultima_actividad TIMESTAMP NULL DEFAULT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE,
    FOREIGN KEY (minijuego_id) REFERENCES minijuegos(id),
    UNIQUE KEY uq_progreso_usuario_minijuego (usuario_id, minijuego_id)
);

-- Registrar los tres minijuegos
INSERT INTO minijuegos (codigo, nombre, descripcion)
VALUES
(
    'operaciones_matematicas',
    'Operaciones Matemáticas',
    'Actividades de suma, resta, multiplicación y división por niveles.'
),
(
    'razonamiento_logico',
    'Razonamiento Lógico',
    'Retos de patrones, secuencias, rompecabezas y lógica.'
),
(
    'solucion_problemas',
    'Solución de Problemas Matemáticos',
    'Problemas contextualizados para identificar datos y resolver operaciones.'
)
ON DUPLICATE KEY UPDATE
    nombre = VALUES(nombre),
    descripcion = VALUES(descripcion);

-- Comprobar la creación
SHOW TABLES;

SELECT id, codigo, nombre
FROM minijuegos;