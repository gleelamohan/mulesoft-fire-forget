const { Pool } = require('pg');
const assert = require('assert');


const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://crdrelxzevyyqa:191ad04487de0a0cf97820c20776ffdfe56ec4338f66b304795f23c20210d687@ec2-54-146-91-153.compute-1.amazonaws.com:5432/d46r2lvaeqi3ku',
    ssl: {
      rejectUnauthorized: false,
    }
});

const constructQuery = (client, sql) => {
  return client.query(sql);
};

const parseMessages = (res) => {
  if (res.rowCount === 0) {
      return [];
  }
 assert(res);
  return res.rows.map((row) => {
      return {
          message: row.productname,
          source: row.source,
          orderid: row.orderid,
          productname: row.productname,
          price:row.price,
          status: row.status
      };
  });
};

const fetchMessages = () => {
  const selectMessages = `
      SELECT orderid, productname, source,price,quantity,status
      FROM orders
  `;
  
  // Prevent SQL injection using parametrized queries
  return pool.connect()
      .then((client) => {
        
          return constructQuery(client, selectMessages)
              .then((res) => {
                  client.release();

                  return parseMessages(res);
              })
              .catch((err) => {
                  client.release();
                  // eslint-disable-next-line no-console
                  console.error(err.stack);
              });
      });
};

const insertMessage = (message) => {

  console.log(message);

  var msg = JSON.parse(message);

  console.log(msg.source);
  console.log(msg.message);


  var qty = parseInt(msg.message.Quantity) || 0;
  var businessAddress = msg.message.BillingAddress || '';
  var shippingAddress = msg.message.shippingAddress || '';

  //const insertMsg = `Insert into rabbit_queue values ('${msg.message.orderId}', '${msg.source}')`;

  const insertMsg = `Insert into orders (orderId, productName, price,quantity, status, source) 
                      values ('${msg.message.orderId}','${msg.message.product}','${msg.message.price}'
                      ,'${qty}','${msg.message.Status}',  '${msg.source}')`;

return pool.connect()
      .then((client) => {
        client.query(insertMsg).then((res) => {
          client.release();
			
				});
      });
};


const createTable = ()=>{

}

module.exports = {
  fetchMessages,
  insertMessage
};