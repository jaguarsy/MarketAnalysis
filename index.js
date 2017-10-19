const getAllMarketItemsPrice = require('./steps/2_getAllMarketItemsPrice');
const filterFreightGoodItems = require('./steps/3_filterFreightGoodItems');
const filterProfitableItems = require('./steps/4_filterProfitableItems');
const filterGoodSoldItems = require('./steps/5_filterGoodSoldItems');
const analysis = require('./steps/6_analysis');

// Curse: 10000012, Wicked Creek: 10000006

const regionID = 10000012;

getAllMarketItemsPrice(regionID)
  .then((data) => {
    return filterFreightGoodItems(data, regionID);
  })
  // .then((data) =>
  //   return filterProfitableItems(data, regionID);
  // })
  .then((data) => {
    return filterGoodSoldItems(data, regionID);
  })
  .then((data) => {
    return analysis(data, regionID);
  });