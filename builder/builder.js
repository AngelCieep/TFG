/*
 *
 *  builder.js - Archivo principal del generador.
 *
 *  Expone el endpoint POST /generate que recibe el JSON del disenador.
 *  Orquesta el pipeline completo en el siguiente orden:
 *
 *    1. parser.js  -> Interpreta y normaliza el JSON recibido.
 *    2. verify.js  -> Comprueba que la plantilla y los componentes existen en disco.
 *    3. move.js    -> Copia la plantilla y los componentes al directorio de salida.
 *    4. import.js  -> Genera las sentencias de importacion en App.tsx.
 *
 *  Si cualquier paso falla, responde con HTTP 400 y la lista de errores.
 *  Si todo es correcto, responde con HTTP 200 y el objeto del proyecto generado.
 *
 */

const { parseJson } = require('./parser');
const { verify }    = require('./verify');

module.exports = (app) => {
    app.post('/generate', (req, res) => {
        try {
            const parsed = parseJson(req.body);
            const result = verify(parsed);

            if (!result.ok) {
                return res.status(400).json({
                    ok:       false,
                    errors:   result.errors,
                    warnings: result.warnings,
                });
            }

            return res.json(result);
        } catch (err) {
            return res.status(400).json({ ok: false, errors: [err.message], warnings: [] });
        }
    });
};
