/**
 * Created by AJH322 on 2016-11-11.
 */
var mongoose = require('mongoose');
var conn = mongoose.createConnection('35.160.55.61/car');
var userSchema = new mongoose.Schema({
    car_name: {type: String, default: ""}
});
var car = conn.model('car', userSchema, "car");
module.exports = car;