'use strict';

const mysql = require('mysql2/promise');
const { faker } = require('@faker-js/faker');
const { setTimeout: sleep } = require('node:timers/promises');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'marcus',
  password: process.env.DB_PASSWORD || 'marcus',
  database: process.env.DB_NAME || 'store',
};

async function* generator() {
  while (true) {
    const name = faker.commerce.productName();
    const price = faker.commerce.price(300, 1000, 2); // Price between $300 and $1000
    const amount = faker.number.int({ min: 10, max: 100 });
    await sleep(5000);
    yield { name, price, amount };
  }
}

(async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    for await (let { name, price, amount } of generator()) {
      console.log('inserting new phone');
      const [result] = await connection.execute(
        'INSERT INTO phones (name, price, amount) VALUES (?, ?, ?)',
        [name, price, amount],
      );
      console.log(
        `New row inserted: { id: ${result.insertId}, name: ${name}, price: ${price}, amount: ${amount} }`,
      );
    }
    console.log('finish');
    connection.end();
  } catch (err) {
    console.error(err);
  }
})();
