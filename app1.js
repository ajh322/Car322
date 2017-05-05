var express = require("express");
var path = require("path");
var app = express();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var fs = require('fs');

app.listen(app.get('port'), function () {
    console.log("going");
})