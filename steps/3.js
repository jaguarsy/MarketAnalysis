const func = require('./3_filterFreightGoodItems');
const func4 = require('./4_filterProfitableItems');
const func5 = require('./5_filterGoodSoldItems');
const func6 = require('./6_analysis');

const data = require('../data/OSY_MarketItems.json');

func4(func(data))
  .then(func5)
  .then(func6);