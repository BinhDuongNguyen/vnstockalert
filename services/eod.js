var mongoose = require('mongoose'),
    Eod = mongoose.model('Eod');

var list = function list(req, res) {
    Eod.find({}).sort({'day':-1}).exec(function (err, eods) {
        if (err) {
            return err;
        }
        res.jsonp(eods);
    });
};

var findByTicker = function findByTicker(req, res) {
	Eod.find({
		ticker: req.params.ticker.toUpperCase()
	}).sort({
		'day': 1
	}).exec(function(err, eods) {
		if (err) {
			return err;
		}
		res.send(eods);
	});
}
//TODO: add more services function here

module.exports = {
    list: list,
    findByTicker: findByTicker
};