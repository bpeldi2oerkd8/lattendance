'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');

router.get('/', authenticationEnsurer, (req, res, next) => {
  res.render('slack-id-register', { user: req.user });
});

module.exports = router;