var mongoose = require('mongoose'),
    Eod = mongoose.model('Eod');

var list = function list(req, res) {
    Eod.find({}, function (err, eods) {
        if (err) {
            return err;
        }
        res.jsonp(eods);
    });
};
//TODO: add more services function here

module.exports = {
    list: list
};