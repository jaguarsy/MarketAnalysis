const func = require('./5_filterGoodSoldItems.js');
const func6 = require('./6_analysis');

const data = require('../data/OSY_ProfitableItems.json');

func(data)
  .then(func6);