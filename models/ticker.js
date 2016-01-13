var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var TickerSchema = new Schema({
	ticker: {
		type: String,
		trim: true
	}
});

mongoose.model('Ticker', TickerSchema);