const func = require('./2_getAllMarketItemsPrice.js');
const func3 = require('./3_filterFreightGoodItems');
const func4 = require('./4_filterProfitableItems');
const func5 = require('./5_filterGoodSoldItems');
const func6 = require('./6_analysis');

const data = require('../data/OSY_GoodSoldItems.json');

func(data)
  .then(func3)
  .then(func4)
  .then(func5)
  .then(func6);