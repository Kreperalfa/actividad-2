// app/api/data/route.js
import yahooFinance from "yahoo-finance2";
import { logReturns } from "@/lib/finance";
import { runEvolution } from "@/lib/evolution";

export async function GET() {
  const tickers = [
    "AAPL", "MSFT", "AMZN", "GOOG", "META",
    "NVDA", "TSLA", "INTC", "CSCO", "ADBE",
    "NFLX", "PEP", "QCOM", "TXN", "PYPL"
  ];
  const results = {};

  // 1. Descargar precios históricos
  for (const ticker of tickers) {
    try {
      const data = await yahooFinance.historical(ticker, {
        period1: "2021-08-01",
        period2: "2024-08-01",
        interval: "1d",
      });

      results[ticker] = data.map(d => d.adjClose);
    } catch (error) {
      console.error(`Error al obtener datos de ${ticker}:`, error.message);
      results[ticker] = [];
    }
  }

  // 2. Procesar retornos logarítmicos
  const assetNames = Object.keys(results);
  const assetReturns = assetNames.map(name => logReturns(results[name]));

  // 3. Ejecutar motor evolutivo
  const { bestChromosome, bestFitness, fitnessHistory } = runEvolution(
    assetReturns,
    assetNames.length
  );

  // 4. Formatear datos para el dashboard
  const distributionData = assetNames.map((name, i) => ({
    name,
    value: bestChromosome[i],
  }));

  const fitnessData = fitnessHistory.map((value, index) => ({
    generation: index,
    fitness: value,
  }));

  // 5. Respuesta final
  return Response.json({
    bestFitness,
    distributionData,
    fitnessData,
  });
}
