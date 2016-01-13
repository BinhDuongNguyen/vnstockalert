var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	mailUtil = require('../utils/mailUtil'),
	passcodeUtil = require('../utils/passcodeUtil');

var subject = "request token";

var list = function list(req, res) {
	User.find({}).sort({
		'day': -1
	}).exec(function(err, eods) {
		if (err) {
			return err;
		}
		res.send(users);
	});
};

var requestLogin = function requestLogin(req, res, next) {
	email = req.body.email;
	User.findOne({
		email: email
	}).exec(function(err, user) {
		if (err) {
			console.log(err);
			return err;
		}
		if (user) {
			//TODO: sent token to email
			var key = passcodeUtil(6, 10);
			mailUtil.sentOtpMail(email, key);
			user.otp = key;
			user.save(function(err) {
				if (err) {
					return next(err);
				}
				res.sendStatus(200);
			});
		} else {
			var key = passcodeUtil(6, 10);
			var data = {
				email: email,
				otp: key
			};
			console.log("registering email");
			User.collection.insert(data, function() {
				console.log('Done importing: ' + data.email);
				mailUtil.sentOtpMail(email, key);
				res.sendStatus(200);
			});
		}
	})
}

var login = function login(req, res) {
	var email = req.body.email;
	var otp = req.body.otp;
	User.findOne({
		email: email,
		otp: otp
	}).exec(function(err, user) {
		if (err) {
			console.log(err);
			return err;
		}
		if (user) {
			var token = passcodeUtil(18, 62);
			user.token = token;
			user.save(function() {
				res.send({
					User_id: user._id,
					token: token,
					result: true
				})
			});
		} else {
			res.send({
				result: false
			})
		}
	})
}

//TODO: add more services function here

module.exports = {
	list: list,
	requestLogin: requestLogin,
	login: login
};