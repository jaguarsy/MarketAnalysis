const func = require('./4_filterProfitableItems.js');
const func5 = require('./5_filterGoodSoldItems');
const func6 = require('./6_analysis');

const data = require('../data/OSY_FreightGoodItems.json');

func(data)
  .then(func5)
  .then(func6);