var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

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