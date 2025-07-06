const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json()); // これを追加！フロントエンドから送られるJSONデータを解析する

// --- API ---

// GETリクエスト: /api/customers (全顧客リストを取得)
app.get('/api/customers', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM customers ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラーが発生しました');
  }
});

// POSTリクエスト: /api/customers (新しい顧客を作成) - ★ここから追加★
app.post('/api/customers', async (req, res) => {
  try {
    const { name, contact_person, email } = req.body; // リクエストのbodyからデータを取得
    // INSERT文で新しい顧客をデータベースに追加
    const newCustomer = await db.query(
      'INSERT INTO customers (name, contact_person, email) VALUES ($1, $2, $3) RETURNING *',
      [name, contact_person, email]
    );
    res.json(newCustomer.rows[0]); // 追加された顧客情報を返す
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラーが発生しました');
  }
});
// ★ここまで追加★

// DELETEリクエスト: /api/customers/:id (特定の顧客を削除) - ★ここから追記★
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params; // URLから削除する顧客のIDを取得
    // DELETE文で特定の顧客をデータベースから削除
    await db.query('DELETE FROM customers WHERE id = $1', [id]);
    res.json({ message: '顧客を削除しました' }); // 成功メッセージを返す
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラーが発生しました');
  }
});
// ★ここまで追記★
// PUTリクエスト: /api/customers/:id (特定の顧客情報を更新) - ★ここから追記★
app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params; // URLから更新する顧客のIDを取得
    const { name, contact_person, email } = req.body; // リクエストのbodyから新しいデータを取得
    // UPDATE文で特定の顧客情報をデータベースで更新
    const updatedCustomer = await db.query(
      'UPDATE customers SET name = $1, contact_person = $2, email = $3 WHERE id = $4 RETURNING *',
      [name, contact_person, email, id]
    );
    res.json(updatedCustomer.rows[0]); // 更新された顧客情報を返す
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラーが発生しました');
  }
});
// ★ここまで追記★
// GETリクエスト: /api/customers/:id/tasks (特定顧客のタスクリストを取得) - ★ここから追記★
app.get('/api/customers/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params; // URLから顧客のIDを取得
    // tasksテーブルから、指定されたcustomer_idを持つタスクを取得
    const { rows } = await db.query('SELECT * FROM tasks WHERE customer_id = $1 ORDER BY id ASC', [id]);
    res.json(rows); // 取得したタスクリストを返す
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラーが発生しました');
  }
});
// ★ここまで追記★

// --- サーバー起動 ---
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました。`);
});