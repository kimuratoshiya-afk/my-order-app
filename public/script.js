// public/script.js

document.addEventListener('DOMContentLoaded', () => {
    const ordersTableBody = document.querySelector('#ordersTable tbody');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const ordersTable = document.getElementById('ordersTable');

    // APIからデータを取得して表示する関数
    async function fetchAndDisplayOrders() {
        try {
            loadingDiv.style.display = 'block'; // ローディング表示
            errorDiv.style.display = 'none';    // エラー表示を隠す
            ordersTable.style.display = 'none'; // テーブルを隠す
            ordersTableBody.innerHTML = '';     // 既存のデータをクリア

            // ExpressのAPIエンドポイントにFetch APIでアクセス
            const response = await fetch('/api/orders');

            // レスポンスがOKでない場合 (HTTPステータスが200番台以外)
            if (!response.ok) {
                const errorData = await response.json(); // エラーレスポンスをJSONとしてパース
                throw new Error(`HTTPエラー！ ステータス: ${response.status}, メッセージ: ${errorData.error || '不明なエラー'}`);
            }

            const orders = await response.json(); // レスポンスボディをJSONとしてパース

            loadingDiv.style.display = 'none'; // ローディングを隠す

            if (orders.length === 0) {
                // データがない場合
                ordersTableBody.innerHTML = '<tr><td colspan="7">注文データがありません。</td></tr>';
                ordersTable.style.display = 'table'; // テーブル枠は表示
            } else {
                ordersTable.style.display = 'table'; // テーブルを表示
                // 各注文データをテーブルの行として追加
                orders.forEach(order => {
                    const row = ordersTableBody.insertRow(); // 新しい行を作成

                    // 日付のフォーマット (例: 2023/10/27 10:30:00)
                    const orderDate = new Date(order.order_date).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });

                    // 合計金額を計算
                    const totalPrice = order.qty * order.price;

                    // セルにデータを挿入
                    row.insertCell().textContent = order.order_id;
                    row.insertCell().textContent = orderDate;
                    row.insertCell().textContent = order.customer_name;
                    row.insertCell().textContent = order.prod_name;
                    row.insertCell().textContent = order.qty;
                    row.insertCell().textContent = order.price;
                    row.insertCell().textContent = totalPrice;
                });
            }

        } catch (error) {
            // エラーが発生した場合
            console.error('🛑 注文データの取得中にエラーが発生しました:', error);
            loadingDiv.style.display = 'none'; // ローディングを隠す
            errorDiv.style.display = 'block';   // エラー表示
            errorDiv.textContent = `データの取得に失敗しました。サーバーまたはネットワークを確認してください。詳細: ${error.message}`;
            ordersTable.style.display = 'none'; // テーブルを隠す
        }
    }

    // ページが完全に読み込まれたらデータを取得して表示
    fetchAndDisplayOrders();
});
