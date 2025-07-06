// dotenvを読み込んで、.envファイルを使えるようにする
require('dotenv').config();

// pgライブラリからPoolクラスをインポートする
const { Pool } = require('pg');

// データベース接続プールを作成する
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 作成したプールを他のファイルで使えるようにエクスポートする
module.exports = {
  query: (text, params) => pool.query(text, params),
};