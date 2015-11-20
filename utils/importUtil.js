var mongoose = require('mongoose');
var fs = require('fs');
var readline = require('readline');
var dateUtil = require('../utils/dateUtil');
var dataUtil = require('../utils/dataUtil');
var Eod = mongoose.model('Eod');
var signal = mongoose.model('Signal');
var async = require('async');

var getAllTicker = function getAllTicker(arr) {
    var tickerArr = [];
    var ticker = "";
    for (var i = 1; i < arr.length; i++) {
        if (arr[i].ticker !== ticker) {
            tickerArr.push(arr[i].ticker);
        }
        ticker = arr[i].ticker;
    }
    return tickerArr;
}

var getAllState = function getAllState(data, ticker, callback) {
    async.parallel([
            function(callback) {
                dataUtil.getSMA10State(data, ticker, function(ret) {
                    callback(null, ret);
                });
            },
            function(callback) {
                dataUtil.getSMA20State(data, ticker, function(ret) {
                    callback(null, ret);
                });
            },
            function(callback) {
                dataUtil.getSMA10CrossSMA20State(data, ticker, function(ret) {
                    callback(null, ret);
                });
            },
            function(callback) {
                dataUtil.getMACDState(data, ticker, function(ret) {
                    callback(null, ret);
                });
            }
        ],
        function(err, results) {
            var newArr = [];
            for (var i = 0; i < results[0].state.length; i++) {
                if (results[0].state[i] === false || results[1].state[i] === false || results[2].state[i] === false || results[3].state[i] === false) {
                    newArr.push(false);
                }
                else {
                    newArr.push(results[0].state[i] + results[1].state[i] + results[2].state[i] + results[3].state[i]);
                }
            };
            var signal = {
                ticker: ticker,
                day: results[0].day,
                sma10Signal: results[0].state,
                sma20Signal: results[1].state,
                sma10Over20Signal: results[2].state,
                macdSignal: results[3].state,
                state: newArr
            };
            callback(signal);
        });
}

var process = function process(data, arr, callback) {
    var retArr = [];
    async.each(arr, function(ticker, callback) {
        getAllState(data, ticker, function(ret) {
            retArr.push(ret);
            callback();
        });
    }, function() {
        callback(retArr);
    });

}

var translateData = function translateData(arr) {
    var data = [];
    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < arr[i].day.length; j++) {
            data.push({
                ticker: arr[i].ticker,
                day: arr[i].day[j],
                sma10Signal: arr[i].sma10Signal[j],
                sma20Signal: arr[i].sma20Signal[j],
                sma10Over20Signal: arr[i].sma10Over20Signal[j],
                macdSignal: arr[i].macdSignal[j],
                state: arr[i].state[j]
            })
        }
    }
    return data;
}

module.exports = {
    getAllTicker:getAllTicker,
    getAllState:getAllState,
    process:process,
    translateData:translateData
}