// lib/finance.js
// ===============================================
// Módulo de funciones financieras para el proyecto
// "Evolución de Carteras (Frontera de Markowitz)"
// ===============================================

import * as math from "mathjs";

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
 * Calcula la matriz de covarianzas de un conjunto de activos.
 * Usa mathjs para mayor eficiencia.
 * @param {Array<Array<number>>} data - Matriz de retornos de varios activos
 * @returns {Array<Array<number>>} - Matriz de covarianzas
 */
export function covarianceMatrix(data) {
  if (!data || data.length === 0) return [];
  return math.cov(data);
}

/**
 * Calcula el Índice de Sharpe de un portafolio.
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
  // riskFreeRate llega en escala ANUAL (ej. 0.01 = 1%), pero portfolioReturns
  // son retornos diarios, así que hay que llevar la tasa a escala diaria
  // antes de restarla. Sin esto, el excessReturn queda dominado por la
  // constante anual y el Sharpe deja de reflejar el retorno real de la cartera.
  const dailyRiskFreeRate = riskFreeRate / 252;
  const avgReturn = portfolioReturns.reduce((a, b) => a + b, 0) / portfolioReturns.length;
  const excessReturn = avgReturn - dailyRiskFreeRate;
  const stdDev = math.std(portfolioReturns);
  return stdDev === 0 ? 0 : excessReturn / stdDev;
}
