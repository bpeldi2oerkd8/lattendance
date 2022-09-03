'use strict';
const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/',
  passport.authenticate('basic', { session: false }),
  (req, res, next) => {
    const from = req.query.from;
    if(from) {
      res.cookie('loginFrom', from, { expires: new Date(Date.now() + 600000)});
    }
    res.render('login', { login_page: true });
});

module.exports = router;