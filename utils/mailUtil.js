var nodemailer = require('nodemailer');
// var generator = require('xoauth2').createXOAuth2Generator({
//     user: 'duong@dongbat.com',
//     clientId: '915661824294-k9q6roipuicd0q90v7h2l3mjjgm267o4.apps.googleusercontent.com',
//     clientSecret: 'tyeO__F2HxDRVCFkftVVaV0j',
//     refreshToken: '1/oY-kexLoelT4Hcu3kjUcuerHAvrLCkGiQz7ZgIdYyTw',
//     accessToken: 'ya29.TQJR5wJ4jqbPwWyJBYbF91pDR87xm_GP7uXuKi1K62ZhtEN6Atc1NlLcNIXegbdmZOKU' // optional
// });

// listen for token updates
// you probably want to store these to a db
// generator.on('token', function(token) {
//     console.log('New token for %s: %s', token.user, token.accessToken);
// });

// login
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'duong@dongbat.com',
        pass: 'duongnb.fpt2810'
    }
});

// send mail
var sentOtpMail = function sentMail(recipients, body) {
    transporter.sendMail({
        from: 'duong@dongbat.com',
        to: recipients,
        subject: "OTP mail",
        text: body
    }, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent');
        }
    });
}

module.exports = {
    sentOtpMail: sentOtpMail
}