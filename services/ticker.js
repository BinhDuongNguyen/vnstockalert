var mongoose = require('mongoose'),
	dateUtil = require('../utils/dateUtil'),
	Ticker = mongoose.model('Ticker');

var list = function list(req, res) {
	Ticker.find({}, function(err, indexs) {
		if (err) {
			return err;
		}
		res.json(indexs);
	});
}


module.exports = {
	list: list
};