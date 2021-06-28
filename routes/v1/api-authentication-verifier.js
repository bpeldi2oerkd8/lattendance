'use strict';
const jwt = require('jsonwebtoken');

//APIのシークレットキー
const serverAPISecret = process.env.SERVER_API_SECRET || require('../../secret_info/server_api_info');

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  //HeaderにAuthorizationがあるかチェック
  if (authHeader) {
    //Bearerのチェック
    if (authHeader.split(" ")[0] === "Bearer") {
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], serverAPISecret);
        const roomId = req.params.roomId;

        //roomIdの検証
        if (decoded.roomId === roomId) {
          next();
        }
        else {
          res.json({
            status: 'NG',
            error: {
              messages: ['検証エラー']
            }
          });
        }
      } catch (e) {
        res.json({
          status: 'NG',
          error: {
            messages: ['Tokenエラー']
          }
        });
      }
    }
    else {
      res.json({
        status: 'NG',
        error: {
          messages: ['ヘッダー形式エラー']
        }
      });
    }
  }
  else {
    res.json({
      status: 'NG',
      error: {
        messages: ['ヘッダーエラー']
      }
    });
  }
}

module.exports = verifyToken;