/**
 * 分析出最适合进货的商品
 */

const fs = require('fs');
const Table = require('cli-table2');
const path = require('path');

const table = new Table({
  head: ['#', 'ID', 'EN', 'ZH', '每立方利润', '预计营业额', '数量', '价格', '体积'],
  colWidths: [5, 10, 60, 40, 18, 20, 6, 16, 10],
});

const FREIGHT_PRICE = 700;  // 运费

const format = (num) => {
  return parseFloat(Math.round(num * 100) / 100)
    .toFixed(2)
    .replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
};

const today = new Date();
const pdLeft = (num) => {
  return num < 10 ? `0${num}` : num;
};

const func = (goodSoldItems, regionID) => {
  console.log('6: 分析出最适合进货的商品');

  const result = [];
  goodSoldItems.forEach(p => {

    // 每立方米的利润
    const profitPerCubicMeter = (p.recommendPrice) / p.volume - FREIGHT_PRICE;
    const expectedProfitPerItem = p.recommendPrice * 0.95 - p.jitaPrice - FREIGHT_PRICE * p.volume;
    const expectedProfitPerDay = (expectedProfitPerItem * p.avgVolumes);

    result.push({
      typeID: p.typeID,
      nameEN: p.nameEN,
      nameZH: p.nameZH,
      profitPerCubicMeter,
      expectedProfitPerDay,
      expectedProfitPerItem,
      num: Math.floor(p.avgVolumes),
      recommendPrice: p.recommendPrice,
      volume: p.volume,
      jitaPrice: p.jitaPrice,
    });
  });

  const sortedResult = result
    .filter(p => p.expectedProfitPerDay > 1000000)
    .sort((a, b) => {
      return b.expectedProfitPerDay - a.expectedProfitPerDay;
    });

  let sumVolume = 0;
  let sumCostPrice = 0;
  let sumProfit = 0;
  sortedResult
    .forEach((p, idx) => {
      sumVolume += p.volume * p.num;
      sumCostPrice += p.jitaPrice * p.num;
      sumProfit += p.expectedProfitPerItem * p.num;

      table.push([
        idx + 1,
        p.typeID,
        p.nameEN,
        p.nameZH,
        format(p.profitPerCubicMeter),
        format(p.expectedProfitPerDay),
        p.num,
        format(p.recommendPrice),
        p.volume * p.num,
      ]);
    });

  console.log(table.toString());

  fs.writeFileSync(
    path.join(__dirname,
      `../data/${regionID}_analysisResult-` +
      `${today.getFullYear()}${pdLeft(today.getMonth() + 1)}${pdLeft(today.getDate())}.json`),
    JSON.stringify(sortedResult));

  let dailyShoppingList = sortedResult
    .map(p => `${p.nameEN} x${p.num}`)
    .join('\n');

  let profitRate = ((sumProfit * 100 / sumCostPrice)).toFixed(2);

  dailyShoppingList += '\n---------------------\n';
  console.log(`总体积：${format(sumVolume)} m^3`);
  dailyShoppingList += `总体积：${format(sumVolume)} m^3\n`;
  console.log(`成本价：${format(sumCostPrice)} isk`);
  dailyShoppingList += `成本价：${format(sumCostPrice)} isk\n`;
  console.log(`预期利润：${format(sumProfit)} isk`);
  dailyShoppingList += `预期利润：${format(sumProfit)} isk`;
  console.log(`回报率：${profitRate}%`);
  dailyShoppingList += `回报率：${profitRate}%`;

  fs.writeFileSync(path.join(__dirname, `../data/${regionID}_dailyShoppingList.txt`), dailyShoppingList);

  console.log('done.');
  return sortedResult;
};

// func();

module.exports = func;