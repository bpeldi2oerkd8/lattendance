'use strict';
const express = require('express');
const authenticationEnsurer = require('./authentication-ensurer');
const router = express.Router();

router.get('/',
  authenticationEnsurer,
  (req, res, next) => {
    const from = req.query.from;
    if(from) {
      res.cookie('loginFrom', from, { expires: new Date(Date.now() + 600000)});
    }
    res.render('login', { login_page: true });
});

module.exports = router;