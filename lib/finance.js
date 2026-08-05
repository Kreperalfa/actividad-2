// lib/finance.js
import * as math from "mathjs";

/**
 * Retornos logarítmicos diarios
 */
export function logReturns(prices) {
  if (!prices || prices.length < 2) return [];
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] === 0) continue;
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }
  return returns;
}

/**
 * Retorno anualizado
 */
export function annualizedReturn(returns) {
  if (!returns || returns.length === 0) return 0;
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  return Math.exp(avg * 252) - 1;
}

/**
 * Covarianza entre dos series
 */
function covariance(a, b) {
  const n = a.length;
  const meanA = a.reduce((sum, v) => sum + v, 0) / n;
  const meanB = b.reduce((sum, v) => sum + v, 0) / n;
  return a.reduce((sum, v, i) => sum + (v - meanA) * (b[i] - meanB), 0) / (n - 1);
}

/**
 * Matriz de covarianzas
 */
export function covarianceMatrix(data) {
  if (!data || data.length === 0) return [];
  const numAssets = data.length;
  const matrix = Array.from({ length: numAssets }, () => Array(numAssets).fill(0));

  for (let i = 0; i < numAssets; i++) {
    for (let j = 0; j < numAssets; j++) {
      matrix[i][j] = covariance(data[i], data[j]);
    }
  }
  return matrix;
}

/**
 * Índice de Sharpe anualizado
 */
export function sharpeRatio(portfolioReturns, riskFreeRateAnnual = 0.03) {
  if (!portfolioReturns || portfolioReturns.length === 0) return 0;

  const avgDaily = portfolioReturns.reduce((a, b) => a + b, 0) / portfolioReturns.length;
  const stdDaily = math.std(portfolioReturns);

  const annualReturn = Math.exp(avgDaily * 252) - 1;
  const annualVol = stdDaily * Math.sqrt(252);

  const excess = annualReturn - riskFreeRateAnnual;
  return excess / annualVol;
}
