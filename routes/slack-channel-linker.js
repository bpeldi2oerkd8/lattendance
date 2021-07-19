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
          user: req.user, 
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

router.get('/:scheduleId/edit', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Schedule.findByPk(req.params.scheduleId)
  .then((schedule) => {
    if(isMine(req, schedule)){
      if(parseInt(req.query.alert) === 1) {
        res.render('slack-channel-linker-edit', { 
          user: req.user, 
          schedule: schedule, 
          csrfToken: req.csrfToken(), 
          channel_alert: true
        });
      }
      else if(parseInt(req.query.alert) === 2) {
        res.render('slack-channel-linker-edit', { 
          user: req.user, 
          schedule: schedule, 
          csrfToken: req.csrfToken(), 
          channel_alert2: true
        });
      }
      else if(parseInt(req.query.alert) === 3) {
        res.render('slack-channel-linker-edit', { 
          user: req.user, 
          schedule: schedule, 
          csrfToken: req.csrfToken(), 
          channel_alert3: true
        });
      }
      else if(parseInt(req.query.alert) === 4) {
        res.render('slack-channel-linker-edit', { 
          user: req.user, 
          schedule: schedule, 
          csrfToken: req.csrfToken(), 
          channel_alert4: true
        });
      }
      else {
        res.render('slack-channel-linker-edit', { 
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

router.post('/:scheduleId/unlink', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Schedule.findByPk(req.params.scheduleId)
  .then((schedule) => {
    if(isMine(req, schedule)){
      const roomId = schedule.roomId;
      if(roomId){
        //scheduleIdの変更
        schedule.roomId = null;
        schedule.save();

        //チャンネル情報の削除
        Room.findByPk(roomId)
        .then((room) => {
          if(room) {
            room.destroy();
            res.redirect(`/schedules/${schedule.scheduleId}`);
          }
          else {
            res.redirect(`/schedules/slack-channel-linker/${schedule.scheduleId}/edit?alert=1`);
          }
        });
      }
      else {
        res.redirect(`/schedules/slack-channel-linker/${schedule.scheduleId}/edit?alert=1`);
      }
    }
    else {
      const err = new Error('指定された予定がない、または、予定する権限がありません');
      err.status = 404;
      next(err);
    }
  });  
});

router.post('/:scheduleId/change-roomid', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Schedule.findByPk(req.params.scheduleId)
  .then((schedule) => {
    if(isMine(req, schedule)){
      const roomId = schedule.roomId;
      const newRoomId = req.body.newRoomId.trim();
      if(roomId && newRoomId){
        if(roomId !== newRoomId){
          //変更後のRoomIDが登録されていないかチェック
          const checkNewRoomId = (newRoomId) => {
            return new Promise((resolve, reject) => {
              Room.findByPk(newRoomId)
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

          checkNewRoomId(newRoomId)
          .then(() => {
            //古いチャンネル情報の削除
            const deleteOldRoom = (roomId) => {
              return new Promise((resolve) => {
                Room.findByPk(roomId)
                .then((room) => {
                  const roomToken = room.roomToken;
                  room.destroy();
                  resolve(roomToken);
                })
                .catch((err) => {
                  reject('古いチャンネル情報が削除できません');
                });
              });
            };

            //新しいチャンネル情報の登録
            const registerRoom = (newRoomId, roomToken) => {
              return new Promise((resolve) => {
                Room.create({
                  roomId: newRoomId,
                  roomToken: roomToken
                })
                .then(() => {
                  resolve();
                })
                .catch((err) => {
                  reject('チャンネル情報が登録できません');
                });
              });
            };

            //該当する予定のroomId変更
            const changeScheduleId = (schedule, newRoomId) => {
              return new Promise((resolve) => {
                schedule.roomId = newRoomId;
                schedule.save();
                resolve();
              });
            };

            const changeRoomId = async () => {
              const roomToken = await deleteOldRoom(roomId).catch((err) => {console.log(err);});
              await registerRoom(newRoomId, roomToken).catch((err) => {console.log(err);});
              await changeScheduleId(schedule, newRoomId);
            };
            
            changeRoomId()
            .then(() => {
              res.redirect(`/schedules/${schedule.scheduleId}`);
            });
          })
          .catch((err) => {
            console.log(err);
            res.redirect(`/schedules/slack-channel-linker/${scheduleId}/edit?alert=2`);
          });
        }
        else {
          res.redirect(`/schedules/${schedule.scheduleId}`);
        }
      }
      else {
        res.redirect(`/schedules/slack-channel-linker/${schedule.scheduleId}/edit?alert=3`);
      }
    }
    else {
      const err = new Error('指定された予定がない、または、予定する権限がありません');
      err.status = 404;
      next(err);
    }
  });  
});

router.post('/:scheduleId/regenerate-token', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Schedule.findByPk(req.params.scheduleId)
  .then((schedule) => {
    if(isMine(req, schedule)){
      const roomId = schedule.roomId;
      if(roomId){
        Room.findByPk(roomId)
        .then((room) => {
          if(room) {
            //roomTokenの生成
            const N = 40;
            const roomToken = crypto.randomBytes(N).toString('base64');

            //roomTokenの上書き
            room.roomToken = roomToken;
            room.save();

            res.render('slack-channel-linker-retoken', {
              user: req.user, 
              schedule: schedule,
              roomToken: roomToken, 
              csrfToken: req.csrfToken()
            });
          }
          else {
            res.redirect(`/schedules/slack-channel-linker/${schedule.scheduleId}/edit?alert=4`);
          }
        });
      }
      else {
        res.redirect(`/schedules/slack-channel-linker/${schedule.scheduleId}/edit?alert=4`);
      }
    }
    else {
      const err = new Error('指定された予定がない、または、予定する権限がありません');
      err.status = 404;
      next(err);
    }
  });  
});

function isMine(req, schedule)  {
  return schedule && parseInt(schedule.createdBy) === parseInt(req.user.id);
}

module.exports = router;