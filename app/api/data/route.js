// app/api/data/route.js
import yahooFinance from "yahoo-finance2";

export async function GET() {
  const tickers = [
    "AAPL", "MSFT", "AMZN", "GOOG", "META",
    "NVDA", "TSLA", "INTC", "CSCO", "ADBE",
    "NFLX", "PEP", "QCOM", "TXN", "PYPL"
  ];
  const results = {};

  for (const ticker of tickers) {
    try {
      const data = await yahooFinance.historical(ticker, {
        period1: "2021-08-01",
        period2: "2024-08-01",
        interval: "1d",
      });

      // Guardamos solo los precios ajustados de cierre
      results[ticker] = data.map(d => d.adjClose);
    } catch (error) {
      console.error(`Error al obtener datos de ${ticker}:`, error.message);
      results[ticker] = [];
    }
  }

  return Response.json(results);
}
