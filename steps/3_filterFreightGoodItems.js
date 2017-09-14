/**
 * 根据指定星域的订单，初步计算出可能盈利的物品
 */

const fs = require('fs');
const path = require('path');
const allTypes = require('../data/typeIDs.json');

// 体积限制
const VOLUME_LIMIT = 3000;
// 当前运费
const FREIGHT_PRICE = 700;

// 预期的运费所占售价的比例
const PREIGHT_VOL_RAGE = 0.1;

const func = (stationMarketItems, regionID) => {
  console.log('3: 正在根据运费比例计算所有可能盈利的物品');

  const result = [];
  for (let i = 0, len = stationMarketItems.length; i < len; i++) {

    const marketItem = stationMarketItems[i];
    const item = allTypes[marketItem.type];
    const freight = item.volume * FREIGHT_PRICE;

    const target = result.find(p => p.typeID === marketItem.type);

    if (target) {
      if (marketItem.buy // 遇到买单，取更大的值作为购买价
        && (target.buy < marketItem.price)) {
        target.buy = marketItem.price;
      } else if (!marketItem.buy) { // 遇到卖单，取更小的值作为售卖价
        if (target.sell === null) { // 如果售卖价格为null，直接赋值
          target.sell = marketItem.price;
        } else if (target.sell > marketItem.price) {
          target.sell = marketItem.price;
        }
      }
    } else {
      result.push({
        typeID: marketItem.type,
        nameEN: item.name.en,
        nameZH: item.name.zh,
        freight,
        volume: item.volume,
        sell: !marketItem.buy ? marketItem.price : null,
        buy: marketItem.buy ? marketItem.price : 0,
      });
    }

  }

  const filteredResult = result.filter(p => {
    return p.volume < VOLUME_LIMIT &&   // 体积小于预期
      (p.freight / (p.sell || p.buy) < PREIGHT_VOL_RAGE);  // 运费比例小于预期
  });

  fs.writeFileSync(path.join(__dirname, `../data/${regionID}_FreightGoodItems.json`), JSON.stringify(filteredResult));

  console.log(`已筛选出${filteredResult.length}件物品`);
  console.log('done.');
  return filteredResult;
};

module.exports = func;