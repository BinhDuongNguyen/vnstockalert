var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var IndexSchema = new Schema({
	name: {
		type: String,
		trim: true
	},
	day: Date,
	tickers: [String]
});

mongoose.model('Index', IndexSchema);