// pages/api/prices.js
import axios from 'axios';

async function getBinanceAllPrices() {
  const res = await axios.get('https://api.binance.com/api/v3/ticker/price');
  const prices = res.data
    .filter((t) => t.symbol.endsWith('USDT'))
    .map((t) => ({
      symbol: t.symbol.replace('USDT', ''),
      price: parseFloat(t.price),
      exchange: 'Binance',
    }));
  return prices;
}

async function getOkxAllPrices() {
  const res = await axios.get('https://www.okx.com/api/v5/market/tickers?instType=SPOT');
  const prices = res.data.data
    .filter((t) => t.instId.endsWith('USDT'))
    .map((t) => ({
      symbol: t.instId.replace('-USDT', ''),
      price: parseFloat(t.last),
      exchange: 'OKX',
    }));
  return prices;
}

export default async function handler(req, res) {
  try {
    const [binancePrices, okxPrices] = await Promise.all([
      getBinanceAllPrices(),
      getOkxAllPrices(),
    ]);

    const allPrices = [...binancePrices, ...okxPrices]; // ✅ Gộp lại thành 1 array

    res.status(200).json(allPrices); // ✅ Trả về mảng duy nhất
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
}

