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


function formatTaiwanDate(dateStr) {
  const date = new Date(dateStr);
  const taiwanYear = date.getFullYear() - 1911;
  const taiwanMonth = date.getMonth() + 1;
  return {
    year: taiwanYear,
    month: taiwanMonth
  };
}

app.all('/api/fees', (req, res) => {
  const { start_date, end_date, min_votes, max_votes } = req.body;

  console.log(start_date);
  console.log(end_date);


  let sql = 'SELECT datetime, value FROM data';
  const params = [];
  const conditions = [];

  if (start_date && end_date) {
    const startYearMonth = formatTaiwanDate(start_date);
    const endYearMonth = formatTaiwanDate(end_date);
    conditions.push(`
      (CAST(substr(datetime, 1, instr(datetime, '年') - 1) AS INTEGER) * 12 + 
      CAST(substr(datetime, instr(datetime, '年') + 1, instr(datetime, '月') - instr(datetime, '年') - 1) AS INTEGER))
      BETWEEN (CAST(? AS INTEGER) * 12 + CAST(? AS INTEGER))
      AND (CAST(? AS INTEGER) * 12 + CAST(? AS INTEGER))
    `);
    params.push(startYearMonth.year, startYearMonth.month, endYearMonth.year, endYearMonth.month);
  }

  if (min_votes && max_votes) {
    conditions.push('(value > ? AND value < ?)');
    params.push(min_votes, max_votes);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  // 打印最终生成的 SQL 和参数
  console.log('Executing SQL:', sql);
  console.log('With parameters:', params);
  db.all(sql, params, (err, rows) => {
    if (err) {
      throw err;
    }

    let tableHTML = `
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 18px;
          text-align: left;
        }
        th, td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f2f2f2;
          color: #333;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
      </style>
      <table>
        <thead>
          <tr>
            <th>統計期</th>
            <th>學雜費</th>
          </tr>
        </thead>
        <tbody>
    `;

    rows.forEach(row => {
      tableHTML += `
        <tr>
          <td>${row.datetime}</td>
          <td>${row.value}</td>
        </tr>
      `;
    });

    tableHTML += `
        </tbody>
      </table>
    `;

    res.send(tableHTML);
  });
});

module.exports = app;
