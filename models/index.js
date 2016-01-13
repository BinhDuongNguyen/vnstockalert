var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var IndexSchema = new Schema({
	name: {
		type: String,
		trim: true
	},
	tickers: [String]
});

mongoose.model('Index', IndexSchema);