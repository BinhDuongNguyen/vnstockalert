var mongoose = require('mongoose'),
	async = require('async'),
	dateUtil = require('../utils/dateUtil'),
	_ = require('lodash'),
	Signal = mongoose.model('Signal'),
	Index = mongoose.model('Index'),
	Ticker = mongoose.model('Ticker'),
	Eod = mongoose.model('Eod');

Date.prototype.yyyymmdd = function() {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
	var dd = this.getDate().toString();
	return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
};

var list = function list(req, res) {
	Signal.find({}).sort({
		'day': 1
	}).exec(function(err, signals) {
		if (err) {
			return err;
		}
		res.send(signals);
	});
};

var ticker = function ticker(req, res) {
	Signal.find({
		ticker: req.params.ticker.toUpperCase()
	}).sort({
		'day': 1
	}).exec(function(err, signals) {
		if (err) {
			return err;
		}
		res.send(signals);
	});
}

var day = function day(req, res) {
	Signal.find({
		day: dateUtil.parseDate(req.params.day)
	}).sort({
		'ticker': -1
	}).exec(function(err, signals) {
		if (err) {
			return err;
		}
		res.send(signals);
	});
}

var filter = function filter(req, res) {
	Signal.find({
		day: dateUtil.parseDate(req.params.day),
		state: parseFloat(req.params.number)
	}).sort({
		'day': 1
	}).exec(function(err, signals) {
		if (err) {
			return err;
		}
		res.send(signals);
	});
}

var lastest = function lastest(req, res) {
	Signal.findOne({
		ticker: "VNM",
	}).sort({
		'day': -1
	}).exec(function(err, ret) {
		if (err) {
			return err;
		}
		Signal.find({
			day: ret.day
		}).sort({
			'ticker': 1
		}).limit(10).exec(function(err, signals) {
			if (err) {
				return err;
			}
			res.send(signals);
		});
	});
}

var lastestByIndex = function lastestByIndex(req, res) {
	Index.find({
		name: req.params.index
	}).exec(function(err, ret) {
		if (err) {
			return err;
		}
		Signal.find({
			ticker: "VNM",
		}).sort({
			'day': -1
		}).limit(1).exec(function(err, day) {
			if (err) {
				return err;
			}
			Signal.find({
				day: day[0].day
			}).sort({
				'ticker': 1
			}).exec(function(err, signals) {
				if (err) {
					return err;
				}
				var retSignals = [];
				for (i = 0; i < signals.length; i++) {
					console.log(signals[i]);
					for (j = 0; j < ret[0].tickers.length; j++) {
						if (signals[i].ticker == ret[0].tickers[j]) {
							retSignals.push(signals[i]);
						}
					}
				}
				res.send(retSignals);
			});
		});
	})
}

var displayInfo = function displayInfo(req, res) {
	var skip = req.params.skip || 0;
	Ticker.find({}).limit(10).skip(skip).exec(function(err, tickers) {
		var data = [];
		async.each(tickers, function(ticker, callback) {
			var obj = {
				ticker: ticker.ticker,
				companyName: null,
				currentPrice: null,
				lastPrice: null,
				currentState: null,
				lastState: null,
				historyPrice: []
			}
			async.parallel([
					function(callback) {
						Eod.find({
							ticker: ticker.ticker
						}).sort({
							'day': -1
						}).limit(60).exec(function(err, eods) {
							if (err) {
								return err;
							}
							obj.currentPrice = eods[0].close;
							obj.lastPrice = eods[1].close;
							for (var i = eods.length - 1; i >= 0; i--) {
								obj.historyPrice.push(eods[i].close);
							};
							callback();
						});
					},
					function(callback) {
						Signal.find({
							ticker: ticker.ticker
						}).sort({
							'day': -1
						}).limit(2).exec(function(err, signals) {
							if (err) {
								return err;
							}
							obj.currentState = signals[0].state;
							obj.lastState = signals[1].state;
							callback();
						});
					}
				],
				// optional callback
				function(err, results) {
					// the results array will equal ['one','two'] even though
					// the second function had a shorter timeout.
					if (err) {
						return err;
					}
					data.push(obj);
					callback();
				});
		}, function(err) {
			if (err) {
				return err;
			}
			console.log("done");
			res.send(data);
		})
	})
}

//TODO: add more services function here

module.exports = {
	list: list,
	ticker: ticker,
	day: day,
	filter: filter,
	lastest: lastest,
	lastestByIndex: lastestByIndex,
	displayInfo: displayInfo
};