var mongoose = require('mongoose'),
	Common = mongoose.model('Common');

var setLastUpdate = function setLastUpdate(date, cb) {
	Common.findOne({}, function(err, common) {
		if (err) {
			cb(err);
		} else {
			if (!common) {
				Common.create({
					lastUpdate: date
				}, cb);
			}
			common.lastUpdate = date;
			common.save(cb);
		}
	});
}

var getLastUpdate = function getLastUpdate(cb) {
	Common.findOne({}, function(err, common) {
		if (err) {
			cb(err);
		} else {
			cb(common.lastUpdate);
		}
	});
}

module.exports = {
	setLastUpdate: setLastUpdate,
	getLastUpdate: getLastUpdate
}