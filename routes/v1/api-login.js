'use strict';
const express = require('express');
const router = express.Router();
const Schedule = require('../../models/schedule');
const jwt = require('jsonwebtoken');
//APIのシークレットキー
const serverAPISecret = process.env.SERVER_API_SECRET || require('../../secret_info/server_api_info');

router.post('/', (req, res) => {
  //roomIDとroomTokenを取得
  const roomId = req.body.roomId;
  const roomToken = req.body.roomToken;

  Schedule.findAll({
    where: {
      roomId: roomId
    }
  })
  .then((schedules) => {
    if(schedules && schedules.length === 1 && schedules[0].roomToken === roomToken) {
      //JWTを生成
      const token = jwt.sign({roomId: roomId}, serverAPISecret, {expiresIn: '1h'});
      res.json({
        status: 'OK',
        data: {
          token: token
        }
      });
    }
    else {
      res.json({
        status: 'NG',
        error: {
          messages: ['認証エラー']
        }
      });
    }
  });
});

module.exports = router;