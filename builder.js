let init = 'Hello World!';

module.exports = (app) => {
    app.get('/', (req, res) => {
        return res.json(init);
    });
};
