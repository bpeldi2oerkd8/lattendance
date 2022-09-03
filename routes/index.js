var express = require('express');
const Schedule = require('../models/schedule');
const moment = require('moment-timezone');
const authenticationEnsurer = require('./authentication-ensurer');
var router = express.Router();

/* GET home page. */
router.get('/',
  authenticationEnsurer,
  function(req, res, next) {
    if(req.user){
      Schedule.findAll({
        where: {
          createdBy: req.user.id
        },
        order: [['updatedAt', 'DESC']]
      }).then((schedules) => {
        schedules.forEach((schedule) => {
          schedule.formattedUpdatedAt = moment(schedule.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
        });
        res.render('index', {
          user: req.user,
          schedules: schedules
        });
      });
    } else {
      res.render('index', { user: req.user });
    }
});

module.exports = router;
