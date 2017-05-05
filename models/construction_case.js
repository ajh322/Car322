/**
 * Created by AJH on 2017-04-23.
 */
var mongoose = require('mongoose');
var conn = mongoose.createConnection('35.160.55.61/car');
var autoIncrement = require('mongoose-auto-increment');
var userSchema = new mongoose.Schema({
    Title: {type: String, required: true},
    Car: {type: String, required: true},
    Region: {type: String, required: true},
    Company: {type: String, required: true},
    Price: {type: String, required: true},
    Time: {type: String, required: true},
    Contents: {type: String, required: true},
    Carimage: {type: String, required: true},
    seq:{type: Number, default: 0 }
},{versionKey: false});
userSchema.plugin(autoIncrement.plugin, { model: 'const_case', field: 'seq' });
var const_case = conn.model('const_case', userSchema, "const_case");
module.exports = const_case;
