/**
 * 根据售卖历史，过滤出过去14天的日均销售额达到标准的物品
 */
const request = require('request');
const fs = require('fs');
const path = require('path');

let priceHistoryCache;
try {
  priceHistoryCache = require('../data/OSY_PriceHistoryCache.json');
} catch (ex) {
  priceHistoryCache = {};
}

// https://crest-tq.eveonline.com/market/10000012/history/?type=https://crest-tq.eveonline.com/inventory/types/9491/
// Curse星域的售卖历史
const url = 'https://crest-tq.eveonline.com/market/10000012/history/?type=https://crest-tq.eveonline.com/inventory/types/';

const func = (profitableItems) => {
  console.log('5: 根据售卖历史，过滤出过去14天的日均销售额达到标准的物品');

  const RANGE = 14;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today - RANGE * 86400000);

  const getAverageSalesOf7Days = (typeID) => {
    return new Promise((resolve, reject) => {
      // console.log(`正在获取物品[${typeID}]的14日均销售额`);

      const priceCache = priceHistoryCache[typeID];

      if (priceCache
        && priceCache.date
        && (new Date() - new Date(priceCache.date)) < 86400000
        && priceCache.avgSales) {
        resolve(priceCache);
      } else {
        request(`${url}${typeID}/`, (err, res, body) => {
          if (err) {
            console.log(err);
            reject(err);
            return;
          }

          const result = JSON.parse(body);
          const priceHistory = result.items;
          const len = priceHistory.length;
          let sumPrice = 0;
          let sumVolumes = 0;
          let i = len - RANGE - 1;
          if (i < 0) {
            i = 0;
          }
          // 计算14天成交总价
          for (; i < len; i++) {
            const price = priceHistory[i];
            if (new Date(price.date) >= startDate) {
              sumPrice += price.volume * (price.avgPrice || 0);
              sumVolumes += price.volume;
            }
          }

          const avgSales = sumPrice / RANGE;
          const avgVolumes = sumVolumes / RANGE;

          priceHistoryCache[typeID] = {
            date: new Date(),
            avgSales,
            avgVolumes,
          };

          resolve({ avgSales, avgVolumes });
        });
      }
    });
  };

  // 以当日Republic Fleet Berserker的14日日均销售额的1/50为标准
  return getAverageSalesOf7Days(31892)
    .then(({ avgSales, avgVolumes }) => {
      console.log(`SALES_LIMIT: ${avgSales}`);
      let salesLimit = avgSales / 50;
      let volumeLimit = 2;

      const result = [];
      return profitableItems.reduce((P, item) => {
        return P.then(() => {
          return getAverageSalesOf7Days(item.typeID)
            .then(({ avgSales, avgVolumes }) => {
              if (avgSales >= salesLimit && avgVolumes >= volumeLimit) {
                console.log(`${item.typeID}\t${item.nameEN}\t${avgSales}\t${avgVolumes}`);

                result.push({
                  jitaPrice: item.jitaPrice,
                  recommendPrice: item.recommendPrice,
                  localSellPrice: item.localSellPrice,
                  localBuyPrice: item.localBuyPrice,
                  typeID: item.typeID,
                  nameEN: item.nameEN,
                  nameZH: item.nameZH,
                  profitRate: item.profitRate,
                  volume: item.volume,
                  avgSales: avgSales,
                  avgVolumes: avgVolumes,
                });
              }
            });
        });
      }, Promise.resolve()).then(() => {
        const sortedResult = result.sort((a, b) => {
          return b.avgSales - a.avgSales;
        });
        fs.writeFileSync(path.join(__dirname, '../data/OSY_PriceHistoryCache.json'), JSON.stringify(priceHistoryCache));
        fs.writeFileSync(path.join(__dirname, '../data/OSY_GoodSoldItems.json'), JSON.stringify(sortedResult));

        console.log(`已筛选出${sortedResult.length}件物品`);
        console.log('done.');
        return sortedResult;
      });
    });
};

module.exports = func;