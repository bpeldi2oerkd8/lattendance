'use strict';
const express = require('express');
const authenticationEnsurer = require('./authentication-ensurer');
const router = express.Router();

router.get('/',
  authenticationEnsurer,
  (req, res, next) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;