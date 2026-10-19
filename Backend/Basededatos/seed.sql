USE neurologic_db;

-- =========================================
-- DATOS INICIALES: MINIJUEGOS
-- =========================================

INSERT INTO minijuegos (codigo, nombre, descripcion, activo)
VALUES
(
    'operaciones_matematicas',
    'Operaciones Matemáticas',
    'Actividades de suma, resta, multiplicación y división organizadas por niveles de dificultad.',
    TRUE
),
(
    'razonamiento_logico',
    'Razonamiento Lógico',
    'Retos de patrones, secuencias, rompecabezas y resolución de problemas de lógica.',
    TRUE
),
(
    'solucion_problemas',
    'Solución de Problemas Matemáticos',
    'Situaciones matemáticas contextualizadas que requieren identificar datos, elegir operaciones y resolver.',
    TRUE
)
ON DUPLICATE KEY UPDATE
    nombre = VALUES(nombre),
    descripcion = VALUES(descripcion),
    activo = VALUES(activo);

-- =========================================
-- CONSULTA DE VERIFICACIÓN
-- =========================================

SELECT id, codigo, nombre, activo
FROM minijuegos
ORDER BY id;