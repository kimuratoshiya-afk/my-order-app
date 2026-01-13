## 1. アプリケーション説明

このアプリケーションは、ブラウザからすべての注文データを（顧客名と商品名を結合して）取得し、HTMLテーブルで表示する機能を提供します。

システム構成は、PostgreSQL DBMSおよびNode.js + Expressでバックエンドを構築し、ブラウザからFetch APIでossdbデータベースにアクセスします。

---

## 2. ファイル構成

```
my-order-app/
├── server.js             # Expressアプリケーションの本体
├── package.json          # Node.jsプロジェクトの設定ファイル
├── create_ossdb.sql      # データベース作成SQL
├── public/               # ブラウザに提供する静的ファイル群
│   ├── index.html        # アプリケーションのメインHTMLファイル
│   └── script.js         # Fetch APIを使ってデータを取得し、HTMLを更新するJavaScript
├── .github/workflows     # GitHub Actionsファイル群
│   └── deploy.yaml       # developブランチpush時のデプロイ処理
└── README.md             # アプリケーションの説明（任意）
```

#### 2.1 データベース：create_ossdb.sqlの内容

```sql
-- ossdb データベースの作成
CREATE DATABASE ossdb WITH
    ENCODING = 'UTF8'
    LC_COLLATE = 'ja_JP.UTF-8'
    LC_CTYPE = 'ja_JP.UTF-8'
    TEMPLATE = template0;

-- ossdb データベースを使用
\c ossdb

-- prod テーブルの作成
CREATE TABLE prod
(prod_id integer ,
prod_name text ,
price integer );

-- customer テーブルの作成
CREATE TABLE customer
(customer_id integer ,
customer_name text);

-- orders テーブルの作成
CREATE TABLE orders
(order_id integer ,
order_date timestamp ,
customer_id integer ,
prod_id integer ,
qty integer );

-- customer データ挿入
INSERT INTO customer(customer_id ,customer_name) VALUES
(1,' 佐藤商事'),
(2,' 鈴木物産'),
(3,' 高橋商店');

-- prod データ挿入
INSERT INTO prod(prod_id ,prod_name ,price) VALUES
(1,' みかん',50),
(2,' りんご',70),
(3,' メロン' ,100);

-- orders データ挿入
INSERT INTO orders(order_id ,order_date ,customer_id ,prod_id ,qty) VALUES
(1, CURRENT_TIMESTAMP ,1 ,1 ,10);
INSERT INTO orders(order_id ,order_date ,customer_id ,prod_id ,qty) VALUES
(2, CURRENT_TIMESTAMP ,2,2,5);
INSERT INTO orders(order_id ,order_date ,customer_id ,prod_id ,qty) VALUES
(3, CURRENT_TIMESTAMP ,3,3,8);
INSERT INTO orders(order_id ,order_date ,customer_id ,prod_id ,qty) VALUES
(4, CURRENT_TIMESTAMP ,2,1,3);
INSERT INTO orders(order_id ,order_date ,customer_id ,prod_id ,qty) VALUES
(5, CURRENT_TIMESTAMP ,3,2,4);
```


## 3. インストール手順

#### 3.1. EC2へのアップロード

- **EC2に自動配信**
  
  GitHubと連携させることで、リポジトリにpushしたコードを自動で開発用EC2インスタンスにアップロードします。

#### 3.2. PostgreSQLデータベースの準備

- **PostgreSQL実行状態確認**
  
  AWS管理コンソールからPostgreSQLが利用可能となっていることを確認します。停止していた場合は再開させます。

- **ossdbデータベース作成**
  
  すでのossdb作成済みの場合はスキップしてください。提供されたSQLスクリプトをPostgreSQLで実行し、データベース、テーブル、および初期データをセットアップします。
  
  ```bash
  cd ~/my-order-app
  psql -h <RDSエンドポイント> -p 5432 -U postgres -d postgres -f create_ossdb.sql
  ```

#### 3.3. Node.jsプロジェクトのセットアップ

- **プロジェクトディレクトリへの移動**
  
  ```bash
  cd ~/my-order-app
  ```

- **Node.jsプロジェクトの初期化**
  
  ```bash
  npm init -y
  ```

- **必要なパッケージのインストール**
  
  ```bash
  npm install express pg dotenv cors
  ```
  
  * `express`: Webアプリケーションフレームワーク
  * `pg`: PostgreSQLデータベースへの接続ドライバー
  * `dotenv`: `.env`ファイルから環境変数を読み込むため
  * `cors`: クロスオリジンリソース共有 (CORS) を許可するため（開発時に便利）

#### 3.4. 環境変数ファイル

- **.envの編集**
  
  GitHub ActionsがSecretsから情報を取得し、プロジェクトのルートディレクトリ (`my-order-app/`) にある `.env` ファイルを作成し、以下の内容を記述します。`rds_end_point_address`と`your_postgres_password` は実際のPostgreSQLのエンドポイントアドレスとパスワードに置き換えてください。
  
  ```dotenv
  # .env
  DB_HOST=rds_end_point_address # PostgreSQLのエンドポイントアドレス
  DB_USER=postgres
  DB_PASSWORD=your_postgres_password
  DB_DATABASE=ossdb
  DB_PORT=5432 # PostgreSQLのポート
  DB_SSL=true # SSL接続の有効化（AWS RDSを使用する場合）
  PORT=3000 # Expressサーバーのポート
  ```

## 4. 実行手順

- **Expressサーバーの起動:**
  
  * プロジェクトのルートディレクトリで、以下のコマンドを実行します。
    
    ```bash
    cd ~/my-order-app
    node server.js
    ```
  
  * コンソールに `🚀 サーバーが http://localhost:3000 で起動しました。` のようなメッセージが表示されれば成功です。

- **ブラウザで確認:**
  
  * PC上でウェブブラウザを開き、`http://<EC2のパブリックDNS>:3000` にアクセスします。
  * データベースから取得した注文データが、顧客名と商品名も一緒にテーブル形式で表示されればインストール成功です。
