const { parseJson } = require('./parser');

module.exports = (app) => {
    app.get('/generate', (req, res) => {
        try {
            const result = parseJson(req.body);
            return res.json(result);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    });
};
