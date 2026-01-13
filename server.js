// server.js

// .env ファイルを読み込み、環境変数をプロセスにロード
require('dotenv').config();

const express = require('express');
const { Pool } = require('pg'); // PostgreSQL用のPool接続
const path = require('path');
const cors = require('cors'); // クロスオリジンリソース共有 (CORS) を許可するため

const app = express();
const port = process.env.PORT || 3000; // 環境変数PORTがあればそれを使用、なければ3000

// 開発用にCORSを許可 (本番環境では必要に応じて制限してください)
app.use(cors());

// Expressで静的ファイルを提供 (publicフォルダの中身をウェブ公開)
// 例: http://localhost:3000/index.html にアクセスすると public/index.html が表示される
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL接続プールの作成
// パスワードなどの機密情報は .env ファイルから読み込む
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false, // SSL接続の設定
    max: 10,                   // プール内の最大接続数
    idleTimeoutMillis: 30000,  // アイドル接続のタイムアウト（ミリ秒）
    connectionTimeoutMillis: 2000 // 接続のタイムアウト（ミリ秒）
});

// データベース接続テスト
pool.connect()
    .then(client => {
        console.log('✅ PostgreSQLに正常に接続されました！');
        client.release(); // 接続を解放
    })
    .catch(err => {
        console.error('❌ PostgreSQL接続エラー:', err.message);
        console.error('  -> .env ファイルのDB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT を確認してください。');
        process.exit(1); // 接続できない場合はアプリケーションを終了
    });

// APIエンドポイント: 全ての注文情報を結合して取得
app.get('/api/orders', async (req, res) => {
    try {
        // orders, customer, prod テーブルを結合して必要な情報を取得
        const query = `
            SELECT
                o.order_id,
                o.order_date,
                c.customer_name,
                p.prod_name,
                o.qty,
                p.price
            FROM
                orders o
            JOIN
                customer c ON o.customer_id = c.customer_id
            JOIN
                prod p ON o.prod_id = p.prod_id
            ORDER BY
                o.order_id ASC;
        `;
        const result = await pool.query(query); // SQLクエリを実行

        res.json(result.rows); // 取得したデータをJSON形式でクライアントに返す
    } catch (err) {
        console.error('🛑 注文情報取得エラー:', err);
        res.status(500).json({ error: 'データベースエラーにより注文情報を取得できませんでした。' });
    }
});

// その他のAPIエンドポイントの例 (必要であれば追加)
app.get('/api/customers', async (req, res) => {
    try {
        const result = await pool.query('SELECT customer_id, customer_name FROM customer');
        res.json(result.rows);
    } catch (err) {
        console.error('🛑 顧客情報取得エラー:', err);
        res.status(500).json({ error: 'データベースエラーにより顧客情報を取得できませんでした。' });
    }
});

// サーバー起動
app.listen(port, () => {
    console.log(`🚀 サーバーが http://localhost:${port} で起動しました。`);
    console.log(`ブラウザで http://localhost:${port} にアクセスしてください。`);
});
