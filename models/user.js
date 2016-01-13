var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
    	type: String
    },
    token: {
        type: String
    }
});

mongoose.model('User', UserSchema);