var mongoose = require('mongoose'),
    Signal = mongoose.model('Signal');

var list = function list(req, res) {
    Signal.find({}, function (err, signals) {
        if (err) {
            return err;
        }
        res.jsonp(signals);
    });
};

//TODO: add more services function here

module.exports = {
    list: list
};