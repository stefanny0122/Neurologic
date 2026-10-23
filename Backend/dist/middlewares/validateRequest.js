export function validateRequest(esquema) {
    return (req, res, next) => {
        const errores = [];
        const cuerpo = req.body;
        if (cuerpo === null ||
            typeof cuerpo !== "object" ||
            Array.isArray(cuerpo)) {
            res.status(400).json({
                exitoso: false,
                mensaje: "El cuerpo de la solicitud debe ser un objeto."
            });
            return;
        }
        for (const [campo, regla] of Object.entries(esquema)) {
            const valor = cuerpo[campo];
            if (valor === undefined ||
                valor === null ||
                valor === "") {
                if (regla.obligatorio) {
                    errores.push(`El campo '${campo}' es obligatorio.`);
                }
                continue;
            }
            if (typeof valor !== regla.tipo) {
                errores.push(`El campo '${campo}' debe ser de tipo ${regla.tipo}.`);
                continue;
            }
            if (regla.tipo === "string" &&
                typeof valor === "string") {
                if (regla.minimo !== undefined && valor.length < regla.minimo) {
                    errores.push(`El campo '${campo}' es demasiado corto.`);
                }
                if (regla.maximo !== undefined && valor.length > regla.maximo) {
                    errores.push(`El campo '${campo}' es demasiado largo.`);
                }
            }
            if (regla.tipo === "number" &&
                typeof valor === "number") {
                if (!Number.isFinite(valor)) {
                    errores.push(`El campo '${campo}' debe ser un número válido.`);
                }
                if (regla.minimo !== undefined && valor < regla.minimo) {
                    errores.push(`El campo '${campo}' está por debajo del mínimo.`);
                }
                if (regla.maximo !== undefined && valor > regla.maximo) {
                    errores.push(`El campo '${campo}' supera el máximo permitido.`);
                }
            }
        }
        if (errores.length > 0) {
            res.status(400).json({
                exitoso: false,
                mensaje: "La solicitud contiene datos inválidos.",
                errores
            });
            return;
        }
        next();
    };
}
