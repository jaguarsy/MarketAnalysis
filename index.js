const getAllMarketItemsPrice = require('./steps/2_getAllMarketItemsPrice');
const filterFreightGoodItems = require('./steps/3_filterFreightGoodItems');
const filterProfitableItems = require('./steps/4_filterProfitableItems');
const filterGoodSoldItems = require('./steps/5_filterGoodSoldItems');
const analysis = require('./steps/6_analysis');

getAllMarketItemsPrice()
  .then(filterFreightGoodItems)
  .then(filterProfitableItems)
  .then(filterGoodSoldItems)
  .then(analysis);