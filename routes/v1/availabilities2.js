'use strict';
const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Schedule = require('../../models/schedule');
const Dates = require('../../models/date');
const Availability = require('../../models/availability');
const validator = require('validator');

// 出欠の更新
router.post('/:roomId/users/:slackId/dates/:dateString',
  (req, res, next) => {
    const roomId = req.params.roomId;
    const slackId = req.params.slackId;
    const dateString = req.params.dateString; //形式 (YYYY-MM-DD)
    let availability = req.body.availability;
    availability = availability ? parseInt(availability) : 0;

    //roomIdからscheduleを見つける
    const getScheduleId = (roomId) => {
      return new Promise((resolve, reject) => {
        if(typeof roomId === "string" && roomId.length === 11) {
          Schedule.findOne({
            where: {
              roomId: roomId
            }
          })
          .then((schedule) => {
            resolve(schedule);
          });
        } else {
          reject('正しいルームIDを入力してください');
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
            resolve(user);
          });
        } else {
          reject('正しいSlackIDを入力してください');
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
            resolve(d);
          });
        } else {
          reject('正しい日付を入力してください');
        }

      });
    };

    //出欠情報を更新し、正常に処理が終わったことを返す
    const getData = async () => {
      const [schedule, user] = await Promise.all([getScheduleId(roomId), getUserId(slackId)]);
      const date = await getDateId(dateString, schedule);
      return [schedule, user, date];
    };

    getData()
    .then(([schedule, user, date]) => {
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
    })
    .catch(([scheduleMessage, userMessage, dateMessage]) => {
      res.json({
        status: 'NG',
        error: {
          messages: [scheduleMessage, userMessage, dateMessage]
        } 
      });
    });
  }
);

// 出席の確認

module.exports = router;