'use strict';
const request = require('supertest');
const app = require('../app');
const passportStub = require('passport-stub');

const User = require('../models/user');
const Schedule = require('../models/schedule');
const Dates = require('../models/date');
const Availability = require('../models/availability');

const deleteScheduleAll = require('../routes/schedules').deleteScheduleAll;

describe('/', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  test('ログイン時にユーザー名が含まれる', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/testuser/)
      .expect(200);
  });
});

/*
describe('/schedules/:scheduleId/users/:userId/dates/:dateId', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  test('出欠が更新できる', (done) => {
    User.upsert({ userId: 0, userName: 'testuser', slackId:'TEST0000000' }).then(() => {
      request(app)
        .post('/schedules')
        .send({ scheduleName: '予定1', description: '説明1', dates: '1/1' })
        .end((err, res) => {
          const createdSchedulePath = res.headers.location;
          const scheduleId = createdSchedulePath.split('/schedules/')[1];
          Date.findOne({
            where: { scheduleId: scheduleId }
          }).then((date) => {
            //ここから更新のテスト
            const userId = 0;
            request(app)
              .post(`/schedules/${scheduleId}/users/${userId}/dates/${date.dateId}`)
              .send({ availability: 2 }) // 出席に更新
              .expect('{"status":"OK","availability":2}')
              .end((err, res) => { deleteScheduleAggregate(scheduleId, done, err); });
          });
        });
    });
  });
});

function deleteScheduleAggregate(scheduleId, done, err) {
  Availability.findAll({
    where: { scheduleId: scheduleId }
  }).then((availabilities) => {
    const promises = availabilities.map((a) => { return a.destroy(); });
    Promise.all(promises).then(() => {
      Date.findAll({
        where: { scheduleId: scheduleId }
      }).then((dates) => {
        const promises = dates.map((d) => { return d.destroy(); });
        Promise.all(promises).then(() => {
          Schedule.findByPk(scheduleId).then((s) => {
            s.destroy().then(() => {
              if (err) return done(err);
              done();
            });
          });
        });
      });
    });
  });
}
*/

describe('/login', () => {
  test('ログインボタンが含まれる', () => {
    return request(app)
      .get('/login')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/<a class="btn btn-dark" href="\/auth\/github"/)
      .expect(200);
  });
});

describe('/logout', () => {
  test('/にリダイレクトされる', () => {
    return request(app)
      .get('/logout')
      .expect('Location', '/')
      .expect(302);
  });
});

describe('/api/v1/schedules', () => {

  test('出欠の更新が正しくできる', () => {
    const scheduleId = '9145a8a6-c7a5-89ec-558f-28692402e698';

    const registerUser = () => {
      return new Promise((resolve) => {
        User.upsert({
          userId: 0,
          userName: 'testuser',
          slackId: 'SLACK000000'
        })
        .then(() => {
          resolve();
        });
      });
    };

    const registerSchedule = () => {
      return new Promise((resolve) => {
        Schedule.upsert({
          scheduleId: scheduleId,
          scheduleName: 'testschedule',
          description: 'This is the test schedule.',
          createdBy: 0,
          updatedAt: new Date(),
          roomId: 'ROOM0000000'
        })
        .then(() => {
          resolve();
        });
      });
    };
    
    const registerDates = () => {
      return new Promise((resolve) => {
        Dates.create({
          date: '1/12',
          scheduleId: scheduleId
        })
        .then((d) => {
          resolve(d);
        })
      });
    };

    Promise.all([registerSchedule(), registerUser(), registerDates()])
    .then((result) => {
      request(app)
      .post('/api/v1/schedules/ROOM0000000/users/SLACK000000/dates/2011-01-12')
      .send({ availability: 2 })
      .expect(`{"status":"OK","data":{"slackId":"SLACK000000","date":${result[2].date},"availability":2}`)
      .end((err, res) => {
        deleteScheduleAll(scheduleId, () => {
          User.destroy({
            where: {
              userId: 0,
              userName: 'testuser',
              slackId: 'SLACK000000'
            }
          });
        });
      });
    });
  });

  test('月と日の先頭が0のとき出欠の更新が正しくできる', () => {
    const scheduleId = '9145a8a6-c7a5-89ec-558f-28692402e698';

    const registerUser = () => {
      return new Promise((resolve) => {
        User.upsert({
          userId: 0,
          userName: 'testuser',
          slackId: 'SLACK000000'
        })
        .then(() => {
          resolve();
        });
      });
    };

    const registerSchedule = () => {
      return new Promise((resolve) => {
        Schedule.upsert({
          scheduleId: scheduleId,
          scheduleName: 'testschedule',
          description: 'This is the test schedule.',
          createdBy: 0,
          updatedAt: new Date(),
          roomId: 'ROOM0000000'
        })
        .then(() => {
          resolve();
        });
      });
    };
    
    const registerDates = () => {
      return new Promise((resolve) => {
        Dates.create({
          date: '1/6',
          scheduleId: scheduleId
        })
        .then((d) => {
          resolve(d);
        });
      });
    };

    Promise.all([registerSchedule(), registerUser(), registerDates()])
    .then((result) => {
      request(app)
      .post('/api/v1/schedules/ROOM0000000/users/SLACK000000/dates/2011-01-06')
      .send({ availability: 2 })
      .expect(`{"status":"OK","data":{"slackId":"SLACK000000","dateId":${result[2].date},"availability":2}`)
      .end((err, res) => {
        deleteScheduleAll(scheduleId, () => {
          User.destroy({
            where: {
              userId: 0,
              userName: 'testuser',
              slackId: 'SLACK000000'
            }
          });
        });
      });
    });
  });

  test('出欠の確認が正しくできる', () => {
    const scheduleId = '9145a8a6-c7a5-89ec-558f-28692402e698';

    const registerUser = () => {
      return new Promise((resolve) => {
        User.upsert({
          userId: 0,
          userName: 'testuser',
          slackId: 'SLACK000000'
        })
        .then(() => {
          resolve();
        });
      });
    };

    const registerSchedule = () => {
      return new Promise((resolve) => {
        Schedule.upsert({
          scheduleId: scheduleId,
          scheduleName: 'testschedule',
          description: 'This is the test schedule.',
          createdBy: 0,
          updatedAt: new Date(),
          roomId: 'ROOM0000000'
        })
        .then(() => {
          resolve();
        });
      });
    };
    
    const registerDates = () => {
      return new Promise((resolve) => {
        Dates.create({
          date: '1/6',
          scheduleId: scheduleId
        })
        .then((d) => {
          resolve(d);
        });
      });
    };

    const registerAvailability = (dateId) => {
      return new Promise((resolve) => {
        Availability.create({
          dateId: dateId,
          userId: 0,
          availability: 2,
          scheduleId: scheduleId
        })
        .then(() => {
          resolve();
        });
      });
    };

    const registerData = async () => {
      const result = await Promise.all([registerSchedule(), registerUser(), registerDates()]);
      const availabilityResult = await registerAvailability(result[2].dateId);
      result.push(availabilityResult);
      return result;
    };

    registerData()
    .then((result) => {
      request(app)
      .get('/api/v1/schedules/ROOM0000000/users/SLACK000000/dates/2011-01-06')
      .expect(`{"status":"OK","data":{"slackId":"SLACK000000","date":${result[2].date},"availability":2}`)
      .end((err, res) => {
        deleteScheduleAll(scheduleId, () => {
          User.destroy({
            where: {
              userId: 0,
              userName: 'testuser',
              slackId: 'SLACK000000'
            }
          });
        });
      });
    });
  });
});