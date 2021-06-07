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

    //roomIdからscheduleIdを見つける
    const getScheduleId = (roomId) => {
      return new Promise((resolve, reject) => {
        if(typeof roomId === "string" && roomId.length === 11) {
          Schedule.findOne({
            where: {
              roomId: roomId
            }
          })
          .then((schedule) => {
            resolve(schedule.scheduleId);
          });
        }

        reject('正しいルームIDを入力してください');
      });
    };

    //slackIdからuserIdを見つける
    const getUserId = (slackId) => {
      return new Promise((resolve, reject) => {
        if(typeof slackId === "string" && slackId.length === 11) {
          User.findOne({
            where: {
              slackId: slackId
            }
          })
          .then((user) => {
            resolve(user.userId);
          });
        }

        reject('正しいSlackIDを入力してください');
      });
    };

    //dateStringからdateIdに変換する
    const getDateId = (dateString, scheduleId) => {
      return new Promise((resolve, reject) => {
        if(validator.isDate(dateString, {
          format: 'YYYY-MM-DD'
        })) {
          const dateData = dateString.split('-');
          let date = dateData[1] + '/' + dateData[2];
          date = date.charAt(0) === '0' ? date.substr(1) : date;
          Dates.findOne({
            where: {
              scheduleId: scheduleId,
              date: date
            }
          })
          .then((d) => {
            resolve(d.dateId);
          });
        }

        reject('正しい日付を入力してください');
      });
    };

    //出欠情報を更新し、正常に処理が終わったことを返す
    const getData = async () => {
      const [scheduleId, userId] = await Promise.all([getScheduleId(roomId), getUserId(slackId)]);
      const dateId = await getDateId(dateString, scheduleId);
      return [scheduleId, userId, dateId];
    };

    getData()
    .then(([scheduleId, userId, dateId]) => {
      Availability.upsert({
        scheduleId: scheduleId,
        userId: userId,
        dateId: dateId,
        availability: availability
      }).then(() => {
        //テスト用
        res.json({ 
          status: 'OK',
          data: {
            scheduleId: scheduleId,
            userId: userId,
            dateId: dateId,
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