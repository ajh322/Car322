/**
 * Created by AJH on 2017-03-25.
 */
var mongoose = require('mongoose');
var conn = mongoose.createConnection('35.160.55.61/car');
var userSchema = new mongoose.Schema({
    part_name: {type: String},
    part_category: {type: String, default: ""},
    img_url:{type:String},
    file_url:{type:String}
});
var part = conn.model('part', userSchema, "part");
module.exports = part;
 