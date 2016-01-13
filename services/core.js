var _ = require('lodash'),
	fs = require('fs'),
	async = require('async'),
	readline = require('readline'),
	mongoose = require('mongoose'),
	importUtil = require('../utils/importUtil'),
	dateUtil = require('../utils/dateUtil'),
	marketService = require('./market'),
	Eod = mongoose.model('Eod'),
	Signal = mongoose.model('Signal'),
	Common = mongoose.model('Common'),
	Ticker = mongoose.model('Ticker');

var showHomePage = function showHomePage(req, res) {
	res.render('index', {
		title: 'STOCK ANALYSE'
	});
};

var fetchDataFromUrl = function fetchDataFromUrl(url) {
	//TODO: implement fetDataFromUrl 
};

var getRawDataFromFile = function getRawDataFromFile(fileName) {
	var rl = readline.createInterface({
		input: fs.createReadStream(fileName)
	});
	var data = [];
	rl.on('line', function(line) {
		var str = line;
		var arr = str.split(',');
		data.push({
			ticker: arr[0],
			day: util.parseDate(arr[1]),
			open: parseFloat(arr[2]),
			high: parseFloat(arr[3]),
			low: parseFloat(arr[4]),
			close: parseFloat(arr[5]),
			volume: parseFloat(arr[6])
		});
	});
	rl.on('close', function() {
		console.log('done');
	});
	return data;
};

var fetchDataFromFileFirstTime = function fetchDataFromFileFirstTime(req, res) {
	var startTime = new Date().getTime();
	async.series([
		function removeEod(cb) {
			Eod.remove({}, cb);
		},
		function fetData(cb) {
			var rl = readline.createInterface({
				input: fs.createReadStream('excel_all_data.csv')
			});
			var data = [];
			var startTime = new Date();
			rl.on('line', function(line) {
				var str = line;
				var arr = str.split(',');
				//fet raw data to mongodb
				if (arr[0] !== "<Ticker>") {
					data.push({
						ticker: arr[0],
						day: dateUtil.parseDate(arr[1]),
						open: parseFloat(arr[2]),
						high: parseFloat(arr[3]),
						low: parseFloat(arr[4]),
						close: parseFloat(arr[5]),
						volume: parseFloat(arr[6]),
					});
				}
			});
			rl.on('close', function() {
				console.log('Done reading: ' + (new Date() - startTime) / 1000 + " seconds");
				startTime = new Date();
				Common.collection.insert({latestUpdate: data[0].day}, function() {});
				Eod.collection.insert(data, function() {
					console.log('Done writing EOD: ' + (new Date() - startTime) / 1000 + " seconds");
					cb();
				});
			});
		}
	], function(err, results) {
		if (err) {
			console.log(err);
		}
		res.send("done");
	});
};

var processSignalFirstTime = function processSignalFirstTime(req, res) {
	var startTime = new Date().getTime();
	async.series([
		function removeSignal(cb) {
			Signal.remove({}, function(err) {
				if (err) {
					console.log(err);
					return err;
				}
				cb(null, 'one');
			});
		},
		function processData(cb) {
			Ticker.find({}, function(err, tickers) {
				if (err) {
					console.log(err);
					return err;
				}
				var tickerArr = importUtil.getAllTicker(tickers);
				var count = 0;
				async.eachLimit(tickerArr, 50,function(ticker, callback) {
					var retArr = [];
					Eod.find({
						ticker: ticker
					}).sort({
						'day': 1
					}).exec(function(err, eods) {
						console.log("number of eods in " + ticker + " is: " + eods.length);
						if (err) {
							console.log(err);
							return err;
						}
						importUtil.getAllState(eods, ticker, function(ret) {
							console.log("number of elements in ret of " + ticker + " is: " + ret.day.length);
							retArr.push(ret);
							var translatedData = importUtil.translateData(retArr);
							Signal.collection.insert(translatedData, function(err, signals) {
								console.log("number of elements in translatedData of " + ticker + " is: " + translatedData.length);
								if (err) {
									console.log(err);
									return err;
								}
								console.log('Done processing: ' + (new Date() - startTime) / 1000 + " seconds");
								count++;
								console.log(count);
								callback();
							});
						});
					});
				}, function(err) {
					if (err) {
						console.log(err);
						return err;
					}
					cb(null, 'two');
				})
			});
		}
	], function(err, results) {
		marketService.processIndexByUpdate();
		res.send("done");
	});
};

var processTickerFirstTime = function processTickerFirstTime(req, res) {
	var startTime = new Date().getTime();
	async.series([
		function removeTicker(cb) {
			Ticker.remove({}, cb);
		},
		function processTicker(cb) {
			var rl = readline.createInterface({
				input: fs.createReadStream('excel_all_data.csv')
			});
			var data = [];
			var startTime = new Date();
			var ticker = "";
			rl.on('line', function(line) {
				var str = line;
				var arr = str.split(',');
				//fet raw data to mongodb
				if (arr[0] !== "<Ticker>") {
					if (arr[0] !== ticker) {
						ticker = arr[0];
						data.push({
							ticker: arr[0],
						});
					}
				}
			});
			rl.on('close', function() {
				console.log('Done reading: ' + (new Date() - startTime) / 1000 + " seconds");
				startTime = new Date();
				Ticker.collection.insert(data, function() {
					console.log('Done writing Ticker: ' + (new Date() - startTime) / 1000 + " seconds");
					cb();
				});
			});
		}
	], function(err, results) {
		res.send("done");
	});
}

/*
 *Each day system will crawl data from link and save to daily excel_all_data.csv
 *Read file dailyexcel_all_data.csv and save all Eod to database
 *Calculate all daily signal from Eod
 */
var fetchDataDaily = function fetchDataDaily(req, res) {
	//TODO: implement fetchDataDaily from file with fixed name. Ex: dailyexcel_all_data.csv
	var startTime = new Date().getTime();
	var rl = readline.createInterface({
		input: fs.createReadStream('test1.csv')
	});
	var data = [];
	var startTime = new Date();
	res.send("processing");
	rl.on('line', function(line) {
		var str = line;
		var arr = str.split(',');
		//fet raw data to mongodb
		if (arr[0] !== "<Ticker>") {
			data.push({
				ticker: arr[0],
				day: dateUtil.parseDate(arr[1]),
				open: parseFloat(arr[2]),
				high: parseFloat(arr[3]),
				low: parseFloat(arr[4]),
				close: parseFloat(arr[5]),
				volume: parseFloat(arr[6]),
			});
		}
	});
	rl.on('close', function() {
		var toDay = data[0].day;
		var tickerArr = importUtil.getAllTicker(data);
		var inputData = [];
		var outputData = [];
		console.log('Done reading: ' + (new Date() - startTime) / 1000 + " seconds");
		async.series([
			function insertEOD(cb) {
				Eod.collection.insert(data, function() {
					console.log('Done writing EOD: ' + (new Date() - startTime) / 1000 + " seconds");
					cb();
				})
			},
			function insertSignal(cb) {
				async.eachSeries(tickerArr, function(ticker, callback) {
					var retArr = [];
					Eod.find({
						ticker: ticker
					}).sort({
						'day': -1
					}).limit(34).exec(function(err, eods) {
						if (err) {
							console.log(err);
							return err;
						}
						importUtil.getAllState(eods.reverse(), ticker, function(ret) {
							console.log(ret);
							retArr.push({
								ticker: ret.ticker,
								day: ret.day[ret.day.length - 1],
								sma10Signal: ret.sma10Signal[ret.day.length - 1],
								sma20Signal: ret.sma20Signal[ret.day.length - 1],
								sma10Over20Signal: ret.sma10Over20Signal[ret.day.length - 1],
								macdSignal: ret.macdSignal[ret.day.length - 1],
								state: ret.state[ret.day.length - 1]
							})
							Signal.collection.insert(retArr, function(err, signals) {
								if (err) {
									console.log(err);
									return err;
								}
								console.log('Done processing: ' + (new Date() - startTime) / 1000 + " seconds");
								callback();
							});
						});
					});
				}, function(err) {
					if (err) {
						console.log(err);
						return err;
					}
					cb();
				})
			}
		], function(err, results) {
			Common.findOne({}, function (err, doc) {
				doc.latestUpdate = data[0].day;
				doc.save();
			})
			market.processIndexByUpdate();
			console.log("Done!")
		});
	});
}

//TODO: add more services function here

//TODO: add all sorting option in funtion that query data from db

module.exports = {
	showHomePage: showHomePage,
	getRawDataFromFile: getRawDataFromFile,
	fetchDataFromFileFirstTime: fetchDataFromFileFirstTime,
	fetchDataDaily: fetchDataDaily,
	fetchDataFromUrl: fetchDataFromUrl,
	processSignalFirstTime: processSignalFirstTime,
	processTickerFirstTime: processTickerFirstTime
};