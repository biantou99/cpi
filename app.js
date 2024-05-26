var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
//在 express.js 中，使用 sqlite3 來操作數據庫，並開啟位置在 db/sqlite.db 的資料庫，需要確認是否成功打開資料庫
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/sqlite.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the sqlite database.');
});
//撰寫 post /api/insert 路由，使用 SQLite 新增一筆電影台詞資料 (provider, movie_title, quote)，到MovieQuotes 中，回傳文字的訊息，不要 json
app.post('/api/insert', (req, res) => {
  const provider = req.body.provider;
  const movie_title = req.body.movie_title;
  const quote = req.body.quote;
  const sql = `INSERT INTO MovieQuotes (provider, movie_title, quote) VALUES ('${provider}', '${movie_title}', '${quote}')`;
  db.run(sql, (err) => {
    if (err) {
      return res.send('新增失敗');
    }
    return res.send('新增成功');
  });
});
//撰寫 /api/quotes 路由，使用 SQL 來查詢 movie_quotes 所有的電影台詞資料，回傳 json 格式的資料就好
app.get('/api/quotes', (req, res) => {
  const sql = 'SELECT * FROM data';
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});
//撰寫 get /api?provider= 路由，使用 SQLite 查詢 MovieQuotes 中，某 provider 提供的所有資料
app.get('/api', (req, res) => {
  const provider = req.query.provider;
  const sql = `SELECT * FROM MovieQuotes WHERE provider = '${provider}'`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});
//撰寫 post /api 路由，使用 SQLite 查詢 movie_quotes 中，某 provider 提供的所有資料
app.post('/api', (req, res) => {
  const provider = req.body.provider;
  const sql = `SELECT * FROM MovieQuotes WHERE provider = '${provider}'`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});
//撰寫 get /api/insert 路由，使用 SQLite 新增一筆電影台詞資料 (provider, movie_title, quote)，到 MovieQuotes 中
app.get('/api/insert', (req, res) => {
  const provider = req.query.provider;
  const movie_title = req.query.movie_title;
  const quote = req.query.quote;
  const sql = `INSERT INTO MovieQuotes (provider, movie_title, quote) VALUES ('${provider}', '${movie_title}', '${quote}')`;
  db.run(sql, (err) => {
    if (err) {
      return res.send('新增失敗');
    }
    return res.send('新增成功');
  });
});

module.exports = app;
