const http = require('http');
const express = require('express');
const app = express();
const port = 3000;
const builder = require('./builder');

app.use(express.json());

builder(app);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});