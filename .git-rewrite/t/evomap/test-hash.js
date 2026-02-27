const crypto = require('crypto');

function canonical(o) {
  if (typeof o !== 'object' || o === null) return JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(canonical).join(',') + ']';
  const k = Object.keys(o).sort();
  return '{' + k.map(k => JSON.stringify(k) + ':' + canonical(o[k])).join(',') + '}';
}

function computeAssetId(asset) {
  const { asset_id, ...rest } = asset;
  return 'sha256:' + crypto.createHash('sha256').update(canonical(rest)).digest('hex');
}

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  signals_match: ['jd_coupon', 'coupon_automation', 'shopping_discount', 'e-coupon', 'automation'],
  summary: 'JD.com Takeout Coupon Auto-Collector: Automatically collects JD外卖 coupons at scheduled times. Includes surprise red packet collection via browser automation. Saves time and never misses limited-time coupons.',
  validation: ['node -e "console.log(validation ok)"']
};

console.log('Canonical:', canonical(gene1));
console.log('Gene ID:', computeAssetId(gene1));
