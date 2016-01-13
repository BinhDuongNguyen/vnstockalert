var mongoose = require('mongoose'),
	async = require('async'),
	dateUtil = require('../utils/dateUtil'),
	Index = mongoose.model('Index'),
	Signal = mongoose.model('Signal'),
	Market = mongoose.model('Market');


var processIndexByName = function processIndexByName(indexName) {
	Common.find({}).exec(function(err, common) {
		if (err) {
			return err;
		};
		Index.find({
			name: indexName
		}).sort({
			'day': 1
		}).exec(function(err, indexes) {
			if (err) {
				return err;
			}
			var sumState = 0;
			var indexSignal = {
				name: indexName,
				state: 0,
				under4: 0,
				under3: 0,
				under2: 0,
				under1: 0,
				mid: 0,
				over1: 0,
				over2: 0,
				over3: 0,
				over4: 0
			};
			async.each(indexes[0].tickers, function(ticker, callback) {
				Signal.find({
					ticker: ticker,
					day: common[0].latestUpdate
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
				Market.findOne({
					name: indexName
				}, function(err, doc) {
					doc = indexSignal;
					doc.save();
				})
			})
		})
	})
}

var processIndexByUpdate = function processIndexByUpdate() {
	Index.find({}).exec(function(err, indexes) {
		if (err) {
			return err;
		};
		async.each(indexes, function(index, callback) {
			processIndexByName(index.name);
			callback();
		}, function(err) {
			if (err) {
				return err;
			}
			console.log("done process index !!");
		});
	})
}


module.exports = {
	processIndexByName: processIndexByName,
	processIndexByUpdate: processIndexByUpdate
}