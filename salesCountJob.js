// 统计指定空间站的物品交易量
const request = require('request');
const fs = require('fs');
const path = require('path');


const regionId = 10000012;  // OSY 10000012
const locationId = 60012799;  //OSY-UD IX 空间站(60012799)
const lastOrdersFile = './data/' + locationId + '_lastOrdersData.json';
const orderHistoryFile = './data/' + locationId + '_orderHistoryData.json';

const fetchOrders = (regionId, page = 1) => {
  return new Promise((resolve, reject) => {
    request.get(`https://esi.tech.ccp.is/latest/markets/${regionId}` +
      `/orders/?datasource=tranquility&order_type=sell&page=${page}`, (err, res, body) => {
      if (err || res.statusCode !== 200) {
        reject(err || body || res.statusText);
        return;
      }

      const currentPageOrders = JSON.parse(body);
      const totalPage = res.headers['x-pages'];
      console.log(`Page: ${page}, Count: ${currentPageOrders.length}`);
      if (page < totalPage) {
        fetchOrders(regionId, page + 1)
          .then(orders => {
            resolve(currentPageOrders.concat(orders));
          });
      } else {
        resolve(currentPageOrders.filter(p => !p.is_buy_order
        && p.location_id === locationId));
      }
    });
  });
};

const task = () => {
  let lastOrders;
  let orderHistory;

  if (!fs.existsSync(lastOrdersFile)) {
    lastOrders = [];
  } else {
    lastOrders = JSON.parse(fs.readFileSync(lastOrdersFile) || []);
  }

  if (!fs.existsSync(orderHistoryFile)) {
    orderHistory = {};
  } else {
    orderHistory = JSON.parse(fs.readFileSync(orderHistoryFile) || {});
  }

  fetchOrders(regionId)
    .then((currentOrders) => {
      console.log(`Total: ${currentOrders.length} - at ${new Date().toLocaleString()}`);

      let count = 0;
      for (let i = 0, len = lastOrders.length; i < len; i++) {
        const lastOrder = lastOrders[i];
        const currentOrder = currentOrders.find(p => p.order_id === lastOrder.order_id);

        if (!orderHistory[lastOrder.type_id]) {
          orderHistory[lastOrder.type_id] = [];
        }

        if (!currentOrder) {
          orderHistory[lastOrder.type_id].push({
            time: new Date(),
            delta: lastOrder.volume_remain,
            price: lastOrder.price,
          });
          count++;
        } else if (currentOrder.volume_remain - lastOrder.volume_remain !== 0) {
          orderHistory[lastOrder.type_id].push({
            time: new Date(),
            delta: currentOrder.volume_remain - lastOrder.volume_remain,
            price: currentOrder.price,
          });
          count++;
        }
      }

      console.log(`共有${count}个订单发生变化。`);
      console.log('------------------------------------------');
      fs.writeFileSync(lastOrdersFile, JSON.stringify(currentOrders || []));
      fs.writeFileSync(orderHistoryFile, JSON.stringify(orderHistory || {}));
    });

  setTimeout(task, 150000);
};

task();