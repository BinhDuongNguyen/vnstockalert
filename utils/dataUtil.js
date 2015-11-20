var talib = require('talib');
var async = require('async');

var caculateSMA = function caculateSMA(arr, inTimePeriod, callback) {
    var ret = {
        day: arr.day,
        sma: []
    };
    talib.execute({
        name: "SMA",
        startIdx: 0,
        endIdx: arr.close.length,
        inReal: arr.close,
        optInTimePeriod: inTimePeriod
    }, function (result) {
        for (var i = 0; i < ret.day.length; i++) {
            if (i < inTimePeriod) {
                ret.sma.push(false);
            }
            else {
                ret.sma.push(result.result.outReal[i - inTimePeriod]);
            }
        }
        callback(ret);
    });
};

var caculateMACD = function caculateMACD(arr, inFast, inSlow, inSignal, callback) {
    var ret = {
        day: arr.day,
        outMACD: [],
        outMACDSignal: [],
        outMACDHist: [],
    };
    var inTimePeriod = inSlow + inSignal;
    talib.execute({
        name: "MACD",
        startIdx: 0,
        endIdx: arr.close.length,
        inReal: arr.close,
        optInFastPeriod: inFast,
        optInSlowPeriod: inSlow,
        optInSignalPeriod: inSignal,
    }, function (result) {
        for (var i = 0; i < ret.day.length; i++) {
            if (i < inTimePeriod) {
                ret.outMACD.push(false);
                ret.outMACDHist.push(false);
                ret.outMACDSignal.push(false);
            }
            else {
                ret.outMACD.push(result.result.outMACD[i - inTimePeriod]);
                ret.outMACDHist.push(result.result.outMACDHist[i - inTimePeriod]);
                ret.outMACDSignal.push(result.result.outMACDSignal[i - inTimePeriod]);
            }
        }
        callback(ret);
    });
};

var getRawDataByTicker = function getRawDataByTicker(arr, ticker) {
    var data = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].ticker == ticker) {
            data.push({
                ticker: arr[i].ticker,
                day: arr[i].day,
                open: arr[i].open,
                high: arr[i].high,
                low: arr[i].low,
                close: arr[i].close,
                volume: arr[i].volume,
            });
        }
        ;
    }
    return data;
};

var getRawDataByDay = function getRawDataByDay(arr, beginDay, endDay) {
    var data = [];
    for (var i = 0; i < arr.length; i++) {
        if (endDay > arr[i].day && arr[i].day > beginDay) {
            data.push({
                ticker: arr[i].ticker,
                day: arr[i].day,
                open: arr[i].open,
                high: arr[i].high,
                low: arr[i].low,
                close: arr[i].close,
                volume: arr[i].volume
            });
        }
    }
    return data;
};

var getRawData = function getRawData(arr) {
    var data = {
        day: [],
        open: [],
        close: [],
        high: [],
        low: [],
        volume: []
    };
    for (var i = 0; i < arr.length; i++) {
        data.day.push(arr[i].day);
        data.open.push(arr[i].open);
        data.close.push(arr[i].close);
        data.high.push(arr[i].high);
        data.low.push(arr[i].low);
        data.volume.push(arr[i].volume);
    };
    return data;
}
var getState = function getState(firstArr, comparedArr) {
    var ret = [];
    for (var i = 0; i < firstArr.length; i++) {
        if (firstArr[i] === false || comparedArr[i] === false) {
            ret.push(false);
        }
        else {
            if (firstArr[i] > comparedArr[i]) {
                ret.push(1);
            }
            else if (firstArr[i] < comparedArr[i]) {
                ret.push(-1);
            }
            else {
                ret.push(0);
            }
        }
    }
    return ret;
}

var getSMA10State = function getSMA10State(arr, ticker, callback) { /*beginDate and endDate using "YYYYMMDD" format*/
    var dataByTicker = getRawDataByTicker(arr, ticker);
    var data = getRawData(dataByTicker);
    caculateSMA(data, 10, function(ret) {
        var obj = {
            day: data.day,
            state: getState(data.close, ret.sma)
        };
        callback(obj);
    });
};

var getSMA20State = function getSMA20State(arr, ticker, callback) {
    var dataByTicker = getRawDataByTicker(arr, ticker);
    var data = getRawData(dataByTicker);
    caculateSMA(data, 20, function(ret) {
        var obj = {
            day: data.day,
            state: getState(data.close, ret.sma)
        };
        callback(obj);
    });
};

var getSMA10CrossSMA20State = function getSMA10CrossSMA20State(arr, ticker, callback) {
    var dataByTicker = getRawDataByTicker(arr, ticker);
    var data = getRawData(dataByTicker);
    async.parallel([
            function(callback) {
                caculateSMA(data, 10, function(ret) {
                    callback(null, ret);
                });
            },
            function(callback) {
                caculateSMA(data, 20, function(ret) {
                    callback(null, ret);
                });
            }
        ],
        function(err, results) {
            var obj = {
                day: data.day,
                state: getState(results[0].sma, results[1].sma)
            };
            callback(obj);
        });
};

var getMACDState = function getMACDState(arr, ticker, callback) {
    var dataByTicker = getRawDataByTicker(arr, ticker);
    var data = getRawData(dataByTicker);
    caculateMACD(data, 12, 26, 9, function(ret) {
        var obj = {
            day: data.day,
            state: getState(ret.outMACDSignal, ret.outMACD)
        };
        callback(obj);
    })
}


module.exports = {
    caculateSMA: caculateSMA,
    caculateMACD: caculateMACD,
    getRawDataByDay: getRawDataByDay,
    getRawDataByTicker: getRawDataByTicker,
    getState: getState,
    getSMA10State: getSMA10State,
    getSMA20State: getSMA20State,
    getSMA10CrossSMA20State: getSMA10CrossSMA20State,
    getMACDState: getMACDState
};
