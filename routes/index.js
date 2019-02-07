var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Node Video Collaboration' });
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'Node Video Collaboration' });
});

router.route('/contact')
  .get(function(req, res, next) {
    res.render('contact', { title: 'Contact Us' });
  })
  .post(function(req, res, next) {
    res.render('thanks', { title: 'Contact Us' });
  });



module.exports = router;
