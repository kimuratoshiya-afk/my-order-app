CREATE DATABASE ossdb WITH
    ENCODING = 'UTF8'
    LC_COLLATE = 'ja_JP.UTF-8'
    LC_CTYPE = 'ja_JP.UTF-8'
    TEMPLATE = template0;

\c ossdb

CREATE TABLE prod
(prod_id integer ,
prod_name text ,
price integer );

CREATE TABLE customer
(customer_id integer ,
customer_name text);

CREATE TABLE orders
(order_id integer ,
order_date timestamp ,
customer_id integer ,
prod_id integer ,
qty integer );

INSERT INTO customer(customer_id ,customer_name) VALUES
(1,' 佐藤商事'),
(2,' 鈴木物産'),
(3,' 高橋商店');

INSERT INTO prod(prod_id ,prod_name ,price) VALUES
(1,' みかん',50),
(2,' りんご',70),
(3,' メロン' ,100);

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

