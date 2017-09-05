/**
 * 原始yaml数据第一次转换处理
 */
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

try {
  const doc = yaml.safeLoad(fs.readFileSync('../sde/fsd/typeIDs.yaml', 'utf8'));
  fs.writeFileSync(path.join(__dirname, '../data/typeIDs.json'), JSON.stringify(doc));
} catch (e) {
  console.log(e);
}