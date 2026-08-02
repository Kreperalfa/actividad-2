import YahooFinance from "yahoo-finance2";

export async function GET() {
  const tickers = [
    "AAPL", "MSFT", "AMZN", "GOOG", "META",
    "NVDA", "TSLA", "INTC", "CSCO", "ADBE",
    "NFLX", "PEP", "QCOM", "TXN", "PYPL"
  ];
  const results = {};
  const yahooFinance = new YahooFinance();

  for (const ticker of tickers) {
    try {
      const data = await yahooFinance.chart(ticker, {
        period1: "2021-08-01",
        period2: "2024-08-01",
        interval: "1d",
      });

      // chart() devuelve un objeto con series de precios
      results[ticker] = data.quotes.map(d => d.adjclose);
    } catch (error) {
      console.error(`Error al obtener datos de ${ticker}:`, error.message);
      results[ticker] = [];
    }
  }

  return Response.json(results);
}
