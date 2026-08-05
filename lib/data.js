// lib/data.js
import yahooFinance from "yahoo-finance2";

/**
 * Descarga precios históricos ajustados de un conjunto de activos.
 * @param {Array<string>} tickers - Lista de símbolos (ej. ["AAPL", "MSFT", "AMZN"])
 * @param {string} startDate - Fecha inicial en formato YYYY-MM-DD
 * @param {string} endDate - Fecha final en formato YYYY-MM-DD
 * @returns {Promise<Object>} - Diccionario { ticker: [precios] }
 */
export async function getHistoricalData(tickers, startDate, endDate) {
  const results = {};

  for (const ticker of tickers) {
    try {
      const data = await yahooFinance.historical(ticker, {
        period1: startDate,
        period2: endDate,
        interval: "1d",
      });

      // Guardamos solo los precios ajustados de cierre
      results[ticker] = data.map(d => d.adjClose);
    } catch (error) {
      console.error(`Error al obtener datos de ${ticker}:`, error.message);
      results[ticker] = []; // evita romper todo si falla un ticker
    }
  }

  return results;
}
