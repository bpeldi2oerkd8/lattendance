'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const Schedule = require('../models/schedule');
const Room = require('../models/room');
const { Op } = require("sequelize");
const crypto = require('crypto');

router.get('/:scheduleId/new', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Schedule.findByPk(req.params.scheduleId)
  .then((schedule) => {
    if(isMine(req, schedule)){
      if(parseInt(req.query.alert) === 1) {
        res.render('slack-channel-linker-new', { 
          user: req.user, 
          schedule: schedule, 
          csrfToken: req.csrfToken(), 
          channel_alert: true
        });
      } else {
        res.render('slack-channel-linker-new', { 
          user: req.user, 
          schedule: schedule, 
          csrfToken: req.csrfToken()
        });
      }
    } else {
      const err = new Error('指定された予定がない、または、予定する権限がありません');
      err.status = 404;
      next(err);
    }
  });
  
});

router.post('/:scheduleId/new2', authenticationEnsurer, csrfProtection, (req, res, next) => {
  const scheduleId = req.body.scheduleId;
  const roomId = req.body.roomId.trim();

  //scheduleIdに紐づくscheduleにroomIdが登録されていないかチェック
  const noRoomId = (scheduleId) => {
    return new Promise((resolve, reject) => {
      Schedule.findByPk(scheduleId)
      .then((schedule) => {
        if(schedule)
          console.log('exist');
        else
          console.log('not exist');
        if(schedule && schedule.roomId === null) {
          resolve(schedule);
        }
        else {
          reject('This schedule is already linked to room ID.');
        }
      });
    });
  };

  //同じRoomIDが登録されていないかチェック
  const checkRoomId = (roomId) => {
    return new Promise((resolve, reject) => {
      Room.findByPk(roomId)
      .then((room) => {
        if(room) {
          reject('Room ID is registered.');
        }
        else {
          resolve();
        }
      });
    });
  };

  Promise.all([noRoomId(scheduleId), checkRoomId(roomId)])
  .then((result) => {
    let schedule = result[0];
    if(isMine(req, schedule)) {
      //roomTokenの生成
      const N = 40;
      const roomToken = crypto.randomBytes(N).toString('base64');

      //チャンネル情報の登録
      Room.create({
        roomId: roomId,
        roomToken: roomToken
      })
      .then(() => {
        //roomIdの登録
        schedule.roomId = roomId;
        schedule.save();

        res.render('slack-channel-linker-new2', { 
          schedule: schedule,
          roomToken: roomToken, 
          csrfToken: req.csrfToken()
        });
      });
    }
    else {
      const err = new Error('指定された予定がない、または、予定する権限がありません');
      err.status = 404;
      next(err);
    }
  })
  .catch((err) => {
    console.log(err);
    res.redirect(`/schedules/slack-channel-linker/${scheduleId}/new?alert=1`);
  });
});

function isMine(req, schedule)  {
  return schedule && parseInt(schedule.createdBy) === parseInt(req.user.id);
}

module.exports = router;