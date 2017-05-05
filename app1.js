var express = require("express");
var path = require("path");
var app = express();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var fs = require('fs');
app.set('port', process.env.PORT || 8080);
app.get('/', function (req, res) {
    console.log("come");
    res.end();
});
app.listen(app.get('port'), function () {
    console.log("going");
})