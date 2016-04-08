const host = "127.0.0.1";
const port = 3001;
const express = require("express");

const app = express();

app.get("/data", (req, res) => {
    const data = { value: Math.random() * 100 };
    console.log('/data request: ', data);

    res.send(data);
});

app.listen(port, host, () => {
    console.log('Data server listen on port: ', port);
});