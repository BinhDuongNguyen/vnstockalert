var mongoose = require('mongoose'),
	async = require('async'),
	dateUtil = require('../utils/dateUtil'),
	Index = mongoose.model('Index'),
	Signal = mongoose.model('Signal');

var list = function list(req, res) {
	Index.find({}, function(err, indexs) {
		if (err) {
			return err;
		}
		res.jsonp(indexs);
	});
};

var splitArr = function splitArr(str, callback) {
	var arr = str.split(" ");
	callback(arr);
}

//TODO: refactor splitArr


var add = function add(req, res) {
	splitArr(req.params.ticker, function(ticker) {
		Index.create({
			name: req.params.name,
			tickers: ticker
		}, function(err, indexs) {
			if (err) {
				return err;
			}
			res.send("done");
		})
	})
}

// Parse day in yyyymmdd format
var showIndexInforByNameAndDay = function showIndexInforByNameAndDay(req, res) {
		Index.find({
			name: req.params.index
		}).sort({
			'day': 1
		}).exec(function(err, indexes) {
			if (err) {
				return err;
			}
			var sumState = 0;
			var indexSignal = {
				under4: 0,
				under3: 0,
				under2: 0,
				under1: 0,
				mid: 0,
				over1: 0,
				over2: 0,
				over3: 0,
				over4: 0,
				state: 0
			};
			async.each(indexes[0].tickers, function(ticker, callback) {
				Signal.find({
					ticker: ticker,
					day: dateUtil.parseDate(req.params.day)
				}).sort({
					'day': 1
				}).exec(function(err, signals) {
					if (err) {
						return err;
					}
					if (signals[0].state == -4) {
						indexSignal.under4 += 1;
					} else if (signals[0].state == -3) {
						indexSignal.under3 += 1;
					} else if (signals[0].state == -2) {
						indexSignal.under2 += 1;
					} else if (signals[0].state == -1) {
						indexSignal.under1 += 1;
					} else if (signals[0].state == 0) {
						indexSignal.mid += 1;
					} else if (signals[0].state == 1) {
						indexSignal.over1 += 1;
					} else if (signals[0].state == 2) {
						indexSignal.over2 += 1;
					} else if (signals[0].state == 3) {
						indexSignal.over3 += 1;
					} else if (signals[0].state == 4) {
						indexSignal.over4 += 1;
					}
					sumState += signals[0].state;
					callback();
				})
			}, function(err) {
				if (err) {
					return err;
				}
				indexSignal.state = sumState / indexes[0].tickers.length;
				res.jsonp(indexSignal);
			})
		})
	}
	//TODO: add more services function here

module.exports = {
	list: list,
	add: add,
	showIndexInforByNameAndDay: showIndexInforByNameAndDay
};