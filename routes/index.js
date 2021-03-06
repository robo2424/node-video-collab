var express = require('express');
var router = express.Router();

var nodemailer = require('nodemailer');
var config = require('../config');
var transporter = nodemailer.createTransport(config.mailer);

/* GET home page. */
router.get('/', function(req, res, next) {
  var params = { title: 'Node Video Collaboration', tasks: [] };

  if (req.user) {
    Task.find({ owner: req.user._id }, function(err, tasks) {
      console.log(tasks);

      params.tasks = tasks;
      res.render('index', params);
    });
  }
  else {
    res.render('index', params);
  }
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'Node Video Collaboration' });
});

router.route('/contact')
  .get(function(req, res, next) {
    res.render('contact', { title: 'Contact Us' });
  })
  .post(function(req, res, next) {
    req.checkBody('name', 'Empty name').notEmpty();
    req.checkBody('email', 'Invalid email').isEmail();
    req.checkBody('message', 'Empty message').notEmpty();
    var errors = req.validationErrors();

    // if there are validation errors
    if (errors) {
      res.render('contact', {
        title: 'Contact Us',
        name: req.body.name,
        email: req.body.email,
        message: req.body.message,
        errorMessages: errors
      });
    }

    else {
      var message = 'From: ' + req.body.name + ' ' + req.body.email + ' <br>' + req.body.message;
      var mailOptions = {
        from: 'Node Video Collab <no-reply@nodevideocollab.com>',
        to: config.email,
        subject: 'You got a new message from visitor',
        html: message
      };

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          return console.log(error);
        }

        res.render('thanks', { title: 'Thank you!' });
      });
    }
});

module.exports = router;
