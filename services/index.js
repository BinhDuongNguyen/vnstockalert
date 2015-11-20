var mongoose = require('mongoose'),
    Index = mongoose.model('Index');

var list = function list(req, res) {
    Index.find({}, function (err, indexs) {
        if (err) {
            return err;
        }
        res.jsonp(indexs);
    });
};
//TODO: add more services function here

module.exports = {
    list: list
};