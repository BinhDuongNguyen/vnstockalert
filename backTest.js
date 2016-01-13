var async = require('async');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SignalSchema = new Schema({
    ticker: {
        type: String,
        trim: true,
        required: true
    },
    day: Date,
    sma10Signal: {
        type: Number,
        default: 0
    },
    sma20Signal: {
        type: Number,
        default: 0
    },
    sma10Over20Signal: {
        type: Number,
        default: 0
    },
    macdSignal: {
        type: Number,
        default: 0
    },
    state: {
        type: Number,
        default: 0
    }
});

mongoose.model('Signal', SignalSchema);

var EodSchema = new Schema({
    ticker: {
        type: String,
        trim: true,
        required: true
    },
    day: Date,
    open: {
        type: Number,
        default: 0
    },
    high: {
        type: Number,
        default: 0
    },
    low: {
        type: Number,
        default: 0
    },
    close: {
        type: Number,
        default: 0
    },
    volume: {
        type: Number,
        default: 0
    }
});

mongoose.model('Eod', EodSchema);

var MarketSchema = new Schema({
    name: {
        type: String
    },
    state: {
        type: Number
    },
    under4: {
        type: Number
    },
    under3: {
        type: Number
    },
    under2: {
        type: Number
    },
    under1: {
        type: Number
    },
    mid: {
        type: Number
    },
    over1: {
        type: Number
    },
    over2: {
        type: Number
    },
    over3: {
        type: Number
    },
    over4: {
        type: Number
    },
});

mongoose.model('Market', MarketSchema);

var Market = mongoose.model('Market');
var Signal = mongoose.model('Signal');
var Eod = mongoose.model('Eod');

mongoose.connect('mongodb://localhost/stock');

var vn30 = ["BVH","CII","CSM","CTG","DPM","EIB","FLC","FPT","GMD","HAG","HCM","HHS","HPG","HSG","HVG","ITA","KBC","KDC","MBB","MSN","PPC","PVD","PVT","REE","SSI","STB","VCB","VIC","VNM","VSH"]

var querySignal = function querySignal(ticker, quantity, callback) {
    var signal = [];
    Signal.find({
        ticker: ticker,
    }).sort({
        'day': -1
    }).limit(quantity).exec(function(err, signals) {
        if (err) {
            return err;
        }
        for (var i = 0; i < signals.length; i++) {
            signal.push(signals[i].state);
        }
        callback(signal.reverse());
    });
}

var queryPrice = function queryPrice(ticker, quantity, callback) {
    var price = [];
    var day = [];
    Eod.find({
        ticker: ticker,
    }).sort({
        'day': -1
    }).limit(quantity).exec(function(err, eods) {
        if (err) {
            return err;
        }
        for (var i = 0; i < eods.length; i++) {
            price.push(eods[i].close);
            day.push(eods[i].day);
        }
        price = price.reverse();
        day = day.reverse();
        var ret = {
            price,
            day
        };
        callback(ret);
    });
}

var queryIndex = function queryIndex(quantity, callback) {
    var index = [];

}

var getAction = function getAction(signal) {
    action = [];
    var prevSignal = false;
    var currentSignal = false;
    for (var i = 0; i < signal.length; i++) {
        currentSignal = signal[i];
        if (prevSignal === false) {
            action.push(false);
        } else {
            if (currentSignal == 4 && currentSignal > prevSignal) {
                action.push("BUY");
            } else if (currentSignal < 4 && prevSignal == 4) {
                action.push("SELL");
            } else {
                action.push(false);
            }
        }
        prevSignal = currentSignal;
    }
    return action;
}

var caculateGainLoss = function caculateGainLoss(ticker, quantity, callback) {
    var result = {
        ticker: ticker,
        timeTest: String(quantity) + " days",
        gainLoss: [],
        profit: 0,
        numberOfAction: 0,
        numberOfGainAction: 0,
        numberOfLossAction: 0
    }
    async.parallel([
            function(callback) {
                queryPrice(ticker, quantity, function(ret) {
                    callback(null, ret);
                })
            },
            function(callback) {
                querySignal(ticker, quantity, function(ret) {
                    callback(null, getAction(ret));
                })
            }
        ],
        function(err, results) {
            var day = results[0].day;
            var price = results[0].price;
            var action = results[1];
            var state = "SELL";
            var fixAccount = 100000;
            var account = 100000;
            var amount = 0;
            var gainLoss = [];
            for (var i = 0; i < price.length; i++) {
                if (action[i] === "BUY") {
                    amount = fixAccount / price[i];
                    state = "BUY";
                    gainLoss.push({
                        state: "BUY",
                        day: day[i],
                        price: price[i]
                    });
                } else if (action[i] === "SELL" && state === "BUY") {
                    var tempProfit = ((amount * price[i]) - fixAccount) / fixAccount;
                    account += (amount * price[i]) - fixAccount;
                    gainLoss.push({
                        state: "SELL",
                        day: day[i],
                        price: price[i],
                        gainLoss: tempProfit
                    });
                    result.numberOfAction += 1;
                    if (tempProfit > 0) {
                        result.numberOfGainAction += 1;
                    } else {
                        result.numberOfLossAction += 1;
                    }
                    state = "SELL";
                } else if (action[i] === "SELL" && state === "SELL") {
                    state = "SELL";
                } else {}
            }
            result.gainLoss = gainLoss;
            result.profit = (account - fixAccount) / fixAccount;
            callback(result);
        });
}

var caculateGainLossInGroup = function caculateGainLossInGroup(group, quantity, callback) {
    var numberOfTicker = group.length;
    var totalGainLoss = 0;
    var numberOfLossTicker = 0;
    var numberOfGainTicker = 0;
    var highestGain = {
        ticker: "",
        value: 0
    }
    var highestLoss = {
        ticker: "",
        value: 0
    }
    async.each(group, function(ticker, callback) {
        caculateGainLoss(ticker, quantity, function (ret) {
            totalGainLoss += ret.profit;
            if (ret.profit > 0) {
                numberOfGainTicker += 1;
            } else {
                numberOfLossTicker += 1;
            }
            if (ret.profit > highestGain.value) {
                highestGain.ticker = ticker;
                highestGain.value = ret.profit;
            }
            if (ret.profit < highestLoss.value) {
                highestLoss.ticker = ticker;
                highestLoss.value = ret.profit;
            }
            callback();
        })
    }, function(err) {
        callback({
            averageGainLoss: totalGainLoss / numberOfTicker,
            numberOfLossTicker: numberOfLossTicker,
            numberOfGainTicker: numberOfGainTicker,
            highestLoss: highestLoss,
            highestGain: highestGain
        })
    });
}

// caculateGainLoss("MSN", 100, function(ret) {
//     console.log(ret);
// })

caculateGainLossInGroup(vn30, 2000, function(ret) {
    console.log(ret);
})