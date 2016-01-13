var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var CommonSchema = new Schema({
	latestUpdate: {
    	type: Date
    }
});

mongoose.model('Common', CommonSchema);