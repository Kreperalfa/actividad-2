// lib/finance.js
// ===============================================
// Módulo de funciones financieras (Client-safe)
// NOTA: funciones que NO usan mathjs (sin dependencias del servidor)
// ===============================================

/**
 * Calcula los retornos logarítmicos diarios de una serie de precios.
 * Fórmula: r_t = ln(P_t / P_{t-1})
 * @param {Array<number>} prices - Lista de precios históricos
 * @returns {Array<number>} - Retornos logarítmicos diarios
 */
export function logReturns(prices) {
  if (!prices || prices.length < 2) return [];
  let returns = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] === 0) continue; // evitar división por cero
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }
  return returns;
}

/**
 * Calcula el retorno anualizado a partir de los retornos diarios.
 * Fórmula compuesta: R_anual = exp(promedio_retornos * 252) - 1
 * @param {Array<number>} returns - Retornos diarios
 * @returns {number} - Retorno anualizado
 */
export function annualizedReturn(returns) {
  if (!returns || returns.length === 0) return 0;
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  return Math.exp(avg * 252) - 1;
}

/**
 * Calcula la desviación estándar de un conjunto de valores.
 * Implementación pura sin dependencias externas.
 * @param {Array<number>} values - Valores a analizar
 * @returns {number} - Desviación estándar
 */
export function standardDeviation(values) {
  if (!values || values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calcula el Índice de Sharpe de un portafolio (versión sin mathjs).
 * Fórmula: S = (E[R_p] - R_f) / σ_p
 * Donde:
 * - E[R_p] = retorno promedio del portafolio
 * - R_f = tasa libre de riesgo (por defecto 0.01 = 1%)
 * - σ_p = desviación estándar de los retornos del portafolio
 * @param {Array<number>} portfolioReturns - Retornos del portafolio
 * @param {number} riskFreeRate - Tasa libre de riesgo (default 0.01)
 * @returns {number} - Índice de Sharpe
 */
export function sharpeRatio(portfolioReturns, riskFreeRate = 0.01) {
  if (!portfolioReturns || portfolioReturns.length === 0) return 0;
  const dailyRiskFreeRate = riskFreeRate / 252;
  const avgReturn = portfolioReturns.reduce((a, b) => a + b, 0) / portfolioReturns.length;
  const excessReturn = avgReturn - dailyRiskFreeRate;
  const stdDev = standardDeviation(portfolioReturns);
  return stdDev === 0 ? 0 : excessReturn / stdDev;
}
