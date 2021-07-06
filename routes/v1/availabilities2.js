'use strict';
const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Schedule = require('../../models/schedule');
const Dates = require('../../models/date');
const Availability = require('../../models/availability');
const validator = require('validator');
const verifyToken = require('./api-authentication-verifier');

// 出欠の更新
router.post('/:roomId/users/:slackId/dates/:dateString',
  verifyToken,
  (req, res, next) => {
    const roomId = req.params.roomId;
    const slackId = req.params.slackId;
    const dateString = req.params.dateString; //形式 (YYYY-MM-DD)
    let availability = req.body.availability;
    availability = availability ? parseInt(availability) : 0;

    //roomIdからscheduleを見つける
    const getScheduleId = (roomId) => {
      return new Promise((resolve, reject) => {
        if(typeof roomId === "string") {
          Schedule.findOne({
            where: {
              roomId: roomId
            }
          })
          .then((schedule) => {
            if(schedule) {
              resolve(schedule);
            }
            else {
              resolve('error');
            }
            
          });
        } else {
          resolve('error2');
        }
        
      });
    };

    //slackIdからuserを見つける
    const getUserId = (slackId) => {
      return new Promise((resolve, reject) => {
        if(typeof slackId === "string" && slackId.length === 11) {
          User.findOne({
            where: {
              slackId: slackId
            }
          })
          .then((user) => {
            if(user) {
              resolve(user);
            }
            else {
              resolve('error');
            }
          });
        } else {
          resolve('error2');
        }

      });
    };

    //dateStringからdateを見つける
    const getDateId = (dateString, schedule) => {
      return new Promise((resolve, reject) => {
        if(validator.isDate(dateString, {
          format: 'YYYY-MM-DD'
        })) {
          const dateData = dateString.split('-');
          let month = dateData[1].charAt(0) === '0' ? dateData[1].substr(1) : dateData[1];
          let day = dateData[2].charAt(0) === '0' ? dateData[2].substr(1) : dateData[2];
          const date = month + '/' + day;

          Dates.findOne({
            where: {
              scheduleId: schedule.scheduleId,
              date: date
            }
          })
          .then((d) => {
            if(d) {
              resolve(d);
            }
            else {
              resolve('error');
            }
          });
        } else {
          resolve('error2');
        }

      });
    };

    //出欠情報を更新し、正常に処理が終わったことを返す
    const getData = async () => {
      const [schedule, user] = await Promise.all([getScheduleId(roomId), getUserId(slackId)]);
      const date = schedule !== 'error' && schedule !== 'error2' ? await getDateId(dateString, schedule) : 'notDisplayError';
      return [schedule, user, date];
    };

    getData()
    .then(([schedule, user, date]) => {
      //すべて成功
      if(schedule !== 'error' && schedule !== 'error2' 
      && user !== 'error' && user !== 'error2'
      && date !== 'error' && date !== 'error2'){
        Availability.upsert({
          scheduleId: schedule.scheduleId,
          userId: user.userId,
          dateId: date.dateId,
          availability: availability
        }).then(() => {
          res.json({
            status: 'OK',
            data: {
              slackId: user.slackId,
              date: date.date,
              availability: availability
            }
          });
        });
      }
      //1つ以上の失敗
      else {
        switch(schedule) {
          case 'error':
            schedule = 'このルームIDはシステムに登録されていません';
            break;
          case 'error2':
            schedule = '正しいルームIDを入力してください';
            break;
          default:
            schedule = '';
        }
        switch(user) {
          case 'error':
            user = 'このSlackIDはシステムに登録されていません';
            break;
          case 'error2':
            user = '正しいSlackIDを入力してください';
            break;
          default:
            user = '';
        }
        switch(date) {
          case 'error':
            date = '入力した日付はこの予定に存在しません';
            break;
          case 'error2':
            date = '正しい日付を入力してください';
            break;
          default:
            date = '';
        }
        // schedule = schedule === 'error' ? 'このルームIDはシステムに登録されていません' : '';
        // user = user === 'error' ? 'このSlackIDはシステムに登録されていません' : '';
        // date = date === 'error' ? '入力した日付はこの予定に存在しません' : '';
        const messages = [];
        if(schedule) {
          messages.push(schedule);
        }
        if(user) {
          messages.push(user);
        }
        if(date) {
          messages.push(date);
        }

        res.json({
          status: 'NG',
          error: {
            messages: messages
          } 
        });
      }
    })
    .catch((err) => {
      res.json({
        status: 'NG',
        error: {
          messages: [err.message]
        } 
      });
    });
  }
);

// 出欠の確認
router.get('/:roomId/users/:slackId/dates/:dateString',
  verifyToken,
  (req, res, next) => {
    const roomId = req.params.roomId;
    const slackId = req.params.slackId;
    const dateString = req.params.dateString; //形式 (YYYY-MM-DD)

    //roomIdからscheduleを見つける
    const getScheduleId = (roomId) => {
      return new Promise((resolve, reject) => {
        if(typeof roomId === "string") {
          Schedule.findOne({
            where: {
              roomId: roomId
            }
          })
          .then((schedule) => {
            if(schedule) {
              resolve(schedule);
            }
            else {
              resolve('error');
            }
          });
        } else {
          // reject('正しいルームIDを入力してください');
          resolve('error2');
        }
        
      });
    };

    //slackIdからuserを見つける
    const getUserId = (slackId) => {
      return new Promise((resolve, reject) => {
        if(typeof slackId === "string") {
          User.findOne({
            where: {
              slackId: slackId
            }
          })
          .then((user) => {
            if(user) {
              resolve(user);
            }
            else {
              resolve('error');
            }
          });
        } else {
          // reject('正しいSlackIDを入力してください');
          resolve('error2');
        }

      });
    };

    //dateStringからdateを見つける
    const getDateId = (dateString, schedule) => {
      return new Promise((resolve, reject) => {
        if(validator.isDate(dateString, {
          format: 'YYYY-MM-DD'
        })) {
          const dateData = dateString.split('-');
          let month = dateData[1].charAt(0) === '0' ? dateData[1].substr(1) : dateData[1];
          let day = dateData[2].charAt(0) === '0' ? dateData[2].substr(1) : dateData[2];
          const date = month + '/' + day;

          Dates.findOne({
            where: {
              scheduleId: schedule.scheduleId,
              date: date
            }
          })
          .then((d) => {
            if(d) {
              resolve(d);
            }
            else {
              resolve('error');
            }
          });
        } else {
          // reject('正しい日付を入力してください');
          resolve('error2');
        }

      });
    };

    //出欠情報を確認し、正常に処理が終わったことを返す
    const getData = async () => {
      const [schedule, user] = await Promise.all([getScheduleId(roomId), getUserId(slackId)]);
      const date = schedule !== 'error' && schedule !== 'error2' ? await getDateId(dateString, schedule) : 'notDisplayError';
      return [schedule, user, date];
    };

    getData()
    .then(([schedule, user, date]) => {
      //すべて成功
      if(schedule !== 'error' && schedule !== 'error2' 
      && user !== 'error' && user !== 'error2'
      && date !== 'error' && date !== 'error2'){
        Availability.findOne({
          where: {
            scheduleId: schedule.scheduleId,
            userId: user.userId,
            dateId: date.dateId
          }
        })
        .then((a) => {
          if(a) {
            res.json({
              status: 'OK',
              data: {
                slackId: user.slackId,
                date: date.date,
                availability: a.availability
              }
            });
          }
          //出欠登録情報がない場合は欠席
          else {
            res.json({
              status: 'OK',
              data: {
                slackId: user.slackId,
                date: date.date,
                availability: 0
              }
            });
          }
        });
      }
      //1つ以上の失敗
      else {
        switch(schedule) {
          case 'error':
            schedule = 'このルームIDはシステムに登録されていません';
            break;
          case 'error2':
            schedule = '正しいルームIDを入力してください';
            break;
          default:
            schedule = '';
        }
        switch(user) {
          case 'error':
            user = 'このSlackIDはシステムに登録されていません';
            break;
          case 'error2':
            user = '正しいSlackIDを入力してください';
            break;
          default:
            user = '';
        }
        switch(date) {
          case 'error':
            date = '入力した日付はこの予定に存在しません';
            break;
          case 'error2':
            date = '正しい日付を入力してください';
            break;
          default:
            date = '';
        }
        // schedule = schedule === 'error' ? 'このルームIDはシステムに登録されていません' : '';
        // user = user === 'error' ? 'このSlackIDはシステムに登録されていません' : '';
        // date = date === 'error' ? '入力した日付はこの予定に存在しません' : '';
        const messages = [];
        if(schedule) {
          messages.push(schedule);
        }
        if(user) {
          messages.push(user);
        }
        if(date) {
          messages.push(date);
        }

        res.json({
          status: 'NG',
          error: {
            messages: messages
          } 
        });
      }
      
    })
    .catch((err) => {
      res.json({
        status: 'NG',
        error: {
          messages: [err.message]
        } 
      });
    });
  }
);

module.exports = router;