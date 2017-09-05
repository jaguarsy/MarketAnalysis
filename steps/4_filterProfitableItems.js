/**
 * 获取吉他的物价，对第五步所获得的物品列表进行进一步筛选，得出理论可盈利物品
 */
const request = require('request');
const fs = require('fs');
const path = require('path');
// 吉他物价
const BASE_URL = 'http://api.eve-central.com/api/marketstat/json';
const LIMIT_PROFIT_RATE = 0.30; // 预期盈利比例，以共和舰队狂战士为标准 (3000000 - 2099955 - 25*700)/2099955 = 0.42

const blackList = [46151];

const func = (freightGoodItems) => {
  const typeIDs = freightGoodItems
    .filter(p => blackList.indexOf(p.typeID) < 0)
    .map(p => p.typeID);

  return new Promise((resolve, reject) => {
    console.log('4: 正在获取吉他的物价，对运费比例合理物品列表进行进一步筛选，得出理论可盈利物品');

    const form = {
      usesystem: '30000142',
      typeid: typeIDs.join(','),
    };

    request.post({
      url: BASE_URL,
      form,
    }, (err, res, body) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }

      const allMarketItems = JSON.parse(body);
      const result = [];

      for (let i = 0, len = allMarketItems.length; i < len; i++) {
        const item = allMarketItems[i];
        const typeID = typeIDs[i];
        const localStationItem = freightGoodItems.find(p => p.typeID === typeID);
        // 如果吉他没有售卖价，直接跳过
        if (!item.sell.min) {
          continue;
        }

        const recommendPrice = (localStationItem.sell || localStationItem.buy) * 0.9; //减少价格竞争的风险

        const profitRate = (recommendPrice // 本地的售卖价或购买价的90%价格为推荐价格
          - item.sell.min   // 吉他的售卖价
          - localStationItem.freight) / item.sell.min;   // 运费

        if (profitRate >= LIMIT_PROFIT_RATE // 过滤利润率小于基准利润率的物品
          && item.sell.min < 20000000) { // 过滤单价大于2000w的物品，减少风险
          result.push({
            jitaPrice: item.sell.min,
            recommendPrice: recommendPrice,
            localSellPrice: localStationItem.sell || 0,
            localBuyPrice: localStationItem.buy || 0,
            typeID,
            nameEN: localStationItem.nameEN,
            nameZH: localStationItem.nameZH,
            volume: localStationItem.volume,
            profitRate,
          });
        }
      }

      const sortedResult = result.sort((a, b) => (b.profitRate - a.profitRate));

      fs.writeFileSync(path.join(__dirname, '../data/OSY_ProfitableItems.json'), JSON.stringify(sortedResult));

      console.log(`已筛选出${result.length}件物品`);
      resolve(sortedResult);
      console.log('done.');
    });
  });
};

module.exports = func;