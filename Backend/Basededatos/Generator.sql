
USE neurologic_db;

CREATE TABLE IF NOT EXISTS preguntas_partida (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    partida_id BIGINT UNSIGNED NOT NULL,
    numero_pregunta INT NOT NULL,
    nivel INT NOT NULL,
    tipo VARCHAR(60) NOT NULL,
    enunciado TEXT NOT NULL,
    opciones JSON NOT NULL,
    respuesta_correcta VARCHAR(255) NOT NULL,
    explicacion TEXT,
    puntos_base INT NOT NULL DEFAULT 10,
    respuesta_usuario VARCHAR(255) NULL,
    es_correcta BOOLEAN NULL,
    puntos_obtenidos INT NOT NULL DEFAULT 0,
    tiempo_respuesta_segundos INT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta DATETIME NULL,

    UNIQUE KEY uq_partida_pregunta (partida_id, numero_pregunta),

    CONSTRAINT fk_preguntas_partida
        FOREIGN KEY (partida_id)
        REFERENCES partidas(id)
);
