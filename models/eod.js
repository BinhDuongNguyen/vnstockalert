var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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