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