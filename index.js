const http = require('http');
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let init = 'Hello World!';

app.get('/', (req, res) => {
    return res.json(init);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});