'use strict';
const passport = require('passport');

function ensure(req, res, next) {
  // ログイン成功時
  if (req.isAuthenticated()) {
    return next();
  }
  // ログイン状態になかったらBasic認証
  passport.authenticate('basic', { session: false }, function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      const err = new Error('認証が失敗しました');
      err.status = 403;
      return next(err);
    }

    return res.redirect('/login?from=' + req.originalUrl);
  })(req, res, next);
}

module.exports = ensure;