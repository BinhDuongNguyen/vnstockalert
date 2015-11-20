var _ = require('lodash'),
    fs = require('fs'),
    async = require('async'),
    readline = require('readline'),
    mongoose = require('mongoose'),
    importUtil = require('../utils/importUtil'),
    dateUtil = require('../utils/dateUtil'),
    Eod = mongoose.model('Eod'),
    Signal = mongoose.model('Signal');

var showHomePage = function showHomePage(req, res) {
    res.render('index', {title: 'STOCK ANALYSE'});
};

var fetchDataFromUrl = function fetchDataFromUrl(url) {
	//TODO: implement fetDataFromUrl 
};

var getRawDataFromFile = function getRawDataFromFile(fileName) {
    var rl = readline.createInterface({
        input: fs.createReadStream(fileName)
    });

    var data = [];
    rl.on('line', function (line) {
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
    rl.on('close', function () {
        console.log('done');
    });
    return data;
};

var fetchDataFromFileFirstTime = function fetchDataFromFileFirstTime(req, res) {
	async.series([
		function removeEod(cb) {
			Eod.remove({}, function (err) {
				if (err) {
					console.log(err);
					return err;
				}
				cb(null, 'one');
			});
		},
		function removeSignal(cb) {
			Signal.remove({}, function (err) {
				if (err) {
					return err;
				}
				cb(null, 'two');
			});	
		},
		function fetData(cb) {
			var rl = readline.createInterface({
		        input: fs.createReadStream('data.csv')
		    });

		    var data = [];
		    rl.on('line', function (line) {
		        var str = line;
		        var arr = str.split(',');
		        //fet raw data to mongodb
		       	data.unshift({
			        ticker: arr[0],
			        day: dateUtil.parseDate(arr[1]),
			        open: parseFloat(arr[2]),
			        high: parseFloat(arr[3]),
			        low: parseFloat(arr[4]),
			        close: parseFloat(arr[5]),
			        volume: parseFloat(arr[6]),
			    });
		    });
		    rl.on('close', function () {
		        Eod.collection.insert(data, function(err, eods) {
		        	if (err) {
		        		console.log(err);
		        		return err;
		        	}
			    });
			    importUtil.process(data, importUtil.getAllTicker(data), function(ret) {
			    	var translatedData = importUtil.translateData(ret);
			        Signal.collection.insert(translatedData, function(err, signals) {
			        	if (err) {
			        		console.log(err);
			        		return err;
			        	}
			        });
			    });
		    });
		    cb(null, 'three');
		}
	], function(err, results) {
	});
};

/*
*Each day system will crawl data from link and save to dailyData.csv
*Read file dailyData.csv and save all Eod to database
*Calculate all daily signal from Eod
*/
var fetchDataDaily = function fetchDataDaily (req, res) {
	//TODO: implement fetchDataDaily from file with fixed name. Ex: dailyData.csv
}

//TODO: add more services function here

module.exports = {
    showHomePage: showHomePage,
    getRawDataFromFile: getRawDataFromFile,
    fetchDataFromFileFirstTime: fetchDataFromFileFirstTime,
    fetchDataDaily: fetchDataDaily,
    fetchDataFromUrl: fetchDataFromUrl
};

