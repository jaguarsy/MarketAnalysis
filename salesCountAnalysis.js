const fs = require('fs');
const request = require('request');
const moneyFormat = require('./utils/moneyFormat');

const locationId = 60012799;
const name = `${locationId}_orderHistoryData`;
const typeIds = require('./data/typeIDs.json');
const data = require(`./data/${name}.json`);
const lastOrders = require(`./data/${locationId}_lastOrdersData.json`);

const result = [];

const limitDate = 86400000;

Object.keys(data).forEach(id => {
  const type = typeIds[id];
  const history = data[id];

  if (history.length) {
    let count = 0;  // 销售量
    let minPrice = Infinity;  // 最低成交价
    let maxPrice = 0; // 最高成交价
    let sale = 0; // 成交总额
    history.forEach(p => {
      if (p.delta < 0 && (new Date() - new Date(p.time)) < limitDate) {
        count -= p.delta;
        if (minPrice > p.price) {
          minPrice = p.price;
        }
        if (maxPrice < p.price) {
          maxPrice = p.price;
        }
        sale += count * p.price;
      }
    });

    const sellOrdersCount = lastOrders
      .filter(p => p.type_id == id
      && !p.is_buy_order
      && p.location_id === locationId)
      .reduce((sum, p) => sum + p.volume_remain, 0);

    if (type.volume * 800 / minPrice < 0.3
      && count > 0) {
      result.push({
        typeId: id,
        nameEN: type.name.en,
        nameZH: type.name.zh,
        volume: type.volume,
        count,
        minPrice,
        formattedMinPrice: moneyFormat(minPrice),
        maxPrice,
        formattedMaxPrice: moneyFormat(maxPrice),
        sale,
        formattedSale: moneyFormat(sale),
        sellOrdersCount,
        saleRate: !sellOrdersCount ? 0 : parseFloat((count / sellOrdersCount).toFixed(2)),
      });
    }
  }
});

const analysisResult = result.sort((a, b) => b.sale - a.sale);
const shoppingList = analysisResult
  .map(p => {
    const count = p.count < p.sellOrdersCount ? Math.floor(p.sellOrdersCount / 2) : Math.floor(p.count / 2);
    return {
      name: p.nameEN,
      count,
    };
  })
  .filter(p => p.count)
  .map(p => `${p.name} x${p.count}`);

fs.writeFileSync(`./data/${name}_analysis.json`, JSON.stringify(analysisResult));
fs.writeFileSync(`./data/${name}_shoppingList.txt`, shoppingList.join('\n'));