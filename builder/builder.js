/*
 *
 *  builder.js - Archivo principal del generador.
 *
 *  Expone el endpoint POST /generate que recibe el JSON del disenador.
 *  Tambien exporta la funcion generate() para que el CLI (build.js) la invoque
 *  directamente sin pasar por HTTP.
 *
 *  Orquesta el pipeline completo en el siguiente orden:
 *
 *    1. parser.js  -> Interpreta y normaliza el JSON recibido.
 *    2. verify.js  -> Comprueba que la plantilla y los componentes existen en disco.
 *    3. move.js    -> Copia la plantilla y los componentes al directorio de salida.
 *    4. import.js  -> Genera App.tsx y src/pages/*.tsx en el proyecto copiado.
 *    5. launch     -> Ejecuta npm install + npm run dev y abre el navegador.
 *
 *  Si cualquier paso falla, el pipeline se detiene y se imprime "Abortando build".
 *
 */

const path             = require('path');
const { spawn, exec }  = require('child_process');

const { parseJson }       = require('./parser');
const { verify }          = require('./verify');
const { move }            = require('./move');
const { generateImports } = require('./import');
const { log }             = require('./functions');

const DEFAULT_OUTPUT_DIR = path.resolve(__dirname, '../output');

// ─── Launch ───────────────────────────────────────────────────────────────────

/**
 * Ejecuta npm install en projectPath (bloqueante), luego npm run dev (no bloqueante)
 * y abre el navegador tras 2 segundos.
 *
 * @param {string} projectPath - Ruta absoluta al directorio del proyecto generado
 * @returns {Promise<void>}
 */
function launch(projectPath) {
    return new Promise((resolve, reject) => {
        log('launch', 'Instalando dependencias...');

        const install = spawn('npm', ['install'], {
            cwd:   projectPath,
            shell: true,
            stdio: 'inherit',
        });

        install.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`npm install termino con codigo ${code}`));
            }

            log('launch', 'Iniciando servidor de desarrollo...');

            spawn('npm', ['run', 'dev'], {
                cwd:   projectPath,
                shell: true,
                stdio: 'inherit',
            });

            setTimeout(() => {
                exec('start http://localhost:5173');
                resolve();
            }, 2000);
        });
    });
}

// ─── Pipeline principal ───────────────────────────────────────────────────────

/**
 * Ejecuta el pipeline completo: parse → verify → move → import → launch.
 *
 * @param {object} json      - JSON del disenador (ya parseado como objeto JS)
 * @param {string} outputDir - Directorio de salida donde se creara el proyecto
 * @returns {Promise<object>} El objeto del proyecto generado
 * @throws {Error} si cualquier fase falla
 */
async function generate(json, outputDir) {
    const parsed = parseJson(json);
    const verified = verify(parsed);

    if (!verified.ok) {
        log('build', 'Abortando build');
        throw new Error(verified.errors.join('\n'));
    }

    const moved = move(verified, outputDir);
    const imported = generateImports(moved);

    await launch(imported.projectPath);

    return imported;
}

// ─── Express endpoint ─────────────────────────────────────────────────────────

module.exports = (app) => {
    app.post('/generate', async (req, res) => {
        const outputDir = req.body.outputDir ?? DEFAULT_OUTPUT_DIR;
        try {
            const result = await generate(req.body, outputDir);
            return res.json({ ok: true, projectPath: result.projectPath });
        } catch (err) {
            log('build', 'Abortando build');
            return res.status(400).json({ ok: false, errors: [err.message], warnings: [] });
        }
    });
};

module.exports.generate = generate;
