const path = require('path');
const fs = require('fs');

let express = require('express');

let app = new express();

app.engine('html', require('ejs').renderFile);
app.use("/scripts", express.static(__dirname + '/scripts'));
app.use("/data", express.static(__dirname + '/../uploads'));

app.get('/player2', function (req, res) {
    res.render('player2.html', {});
});

let address = '0.0.0.0';
let port = "2345";

app.listen(port, address, function (error) {
    if (error) {
        console.error(error)
    } else {
        console.info("==> 🌎  Listening on port %s. Open up %s://%s:%s/ in your browser.",
            port, "http", address === '0.0.0.0' ? 'localhost' : address, port);
    }
});