import fetch from 'node-fetch';

// Định nghĩa sàn & phí
const exchanges = [
  { name: 'Binance', url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', fee: 0.001 },
  { name: 'Coinbase', url: 'https://api.coinbase.com/v2/prices/BTC-USD/spot', fee: 0.005 },
];
const forex = {
  url: 'https://api.exchangerate.host/latest?base=USD&symbols=EUR,JPY',
};

// Hàm lấy giá Crypto
async function fetchCrypto(ex) {
  const res = await fetch(ex.url);
  const json = await res.json();
  let price;
  if (ex.name === 'Binance') price = parseFloat(json.price);
  else price = parseFloat(json.data.amount);
  return { name: ex.name, price, fee: ex.fee };
}

export default async function handler(req, res) {
  const cryptos = await Promise.all(exchanges.map(fetchCrypto));
  const fxRes = await fetch(forex.url);
  const fxJson = await fxRes.json();
  const rates = fxJson.rates;

  // So sánh arbitrage đơn giản
  const opportunities = [];
  for (let i = 0; i < cryptos.length; i++) {
    for (let j = i + 1; j < cryptos.length; j++) {
      const a = cryptos[i], b = cryptos[j];
      const adjA = a.price * (1 + a.fee);
      const adjB = b.price * (1 - b.fee);
      if (adjA < adjB) {
        opportunities.push(`${a.name} → ${b.name}: ${(adjB - adjA).toFixed(2)} USD`);
      }
    }
  }

  res.status(200).json({ cryptos, rates, opportunities });
}
