var express = require('express');
var router = express.Router();
const User = require('../model/user')

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.redirect('/reservations/today')
});

module.exports = router;
