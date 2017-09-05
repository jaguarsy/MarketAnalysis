/**
 * 获取指定星域市场（OSY-UD）的所有在售物品
 * 当前使用EVE CREST API，未来需要更改为ESI
 */

const request = require('request');
const fs = require('fs');
const path = require('path');
const url = 'https://crest-tq.eveonline.com/market/10000012/orders/all/'; // 需要过滤出OSY-UD IX(60012799)空间站

const func = () => {
  return new Promise((resolve, reject) => {
    console.log('2: 正在获取所有本地市场的物价');
    request(url, (err, res, body) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }

      const items = JSON.parse(body).items; //.filter(p => p.stationID === 60012799);
      fs.writeFileSync(path.join(__dirname, '../data/OSY_MarketItems.json'), JSON.stringify(items));
      resolve(items);

      console.log(`已获取${items.length}件物品`);
      console.log('done.');
    });
  });
};

module.exports = func;