let init = 'Hello Worlsd!';

module.exports = (app) => {
    app.get('/', (req, res) => {
        return res.json(init);
    });
};
