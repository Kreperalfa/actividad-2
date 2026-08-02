// lib/genetic.js
// ======================================================
// Motor evolutivo para optimización de carteras (Markowitz)
// ======================================================

import { sharpeRatio } from "./finance.js";

/**
 * Normaliza un vector de pesos para que:
 * - Todos los valores sean >= 0
 * - La suma total sea exactamente 1
 */
export function normalizeWeights(weights) {
  let nonNegative = weights.map(w => (w < 0 ? 0 : w));
  const sum = nonNegative.reduce((a, b) => a + b, 0);
  const safeSum = Math.max(sum, Number.EPSILON); // evita división por cero
  return nonNegative.map(w => w / safeSum);
}

/**
 * Genera un cromosoma aleatorio (cartera).
 * Cada cromosoma es un vector de pesos que suma 1.
 * @param {number} numAssets - Número de activos en el portafolio
 * @returns {Array<number>} - Cromosoma (cartera)
 */
export function randomChromosome(numAssets) {
  const weights = Array.from({ length: numAssets }, () => Math.random());
  return normalizeWeights(weights);
}

/**
 * Genera una población inicial de carteras aleatorias.
 * @param {number} populationSize - Número de carteras a generar
 * @param {number} numAssets - Número de activos en el portafolio
 * @returns {Array<Array<number>>} - Población inicial
 */
export function initialPopulation(populationSize, numAssets) {
  return Array.from({ length: populationSize }, () => randomChromosome(numAssets));
}

/**
 * Función de fitness: evalúa un cromosoma usando el Índice de Sharpe
 * y aplica penalizaciones por concentración excesiva y baja diversidad.
 * @param {Array<number>} portfolioReturns - Retornos del portafolio
 * @param {Array<number>} weights - Pesos del portafolio
 * @returns {number} - Valor de fitness ajustado
 */
export function fitness(portfolioReturns, weights) {
  const sharpe = sharpeRatio(portfolioReturns);

  // Penalización por concentración excesiva
  const sorted = [...weights].sort((a, b) => b - a);
  const top1 = sorted[0];
  const top2 = sorted[1];

  let penalty = 0;
  if (top1 > 0.5) penalty += (top1 - 0.5) * 2;
  if (top1 + top2 > 0.7) penalty += (top1 + top2 - 0.7) * 2;

  // Bonus por diversidad (más activos con peso > 5%)
  const diversity = weights.filter(w => w > 0.05).length;
  const diversityBonus = diversity * 0.01;

  return sharpe - penalty + diversityBonus;
}

/**
 * Selección por torneo: elige al mejor cromosoma entre un subconjunto.
 * @param {Array<Array<number>>} population - Población actual
 * @param {Array<number>} fitnessValues - Valores de fitness de la población
 * @param {number} tournamentSize - Tamaño del torneo
 * @returns {Array<number>} - Cromosoma seleccionado
 */
export function tournamentSelection(population, fitnessValues, tournamentSize = 3) {
  if (population.length === 0) return [];
  let selected = [];
  for (let i = 0; i < tournamentSize; i++) {
    const idx = Math.floor(Math.random() * population.length);
    selected.push({ chrom: population[idx], fit: fitnessValues[idx] });
  }
  selected.sort((a, b) => b.fit - a.fit);
  return selected[0].chrom;
}

/**
 * Cruce aritmético: mezcla los pesos de dos padres.
 * @param {Array<number>} parent1 - Cromosoma padre 1
 * @param {Array<number>} parent2 - Cromosoma padre 2
 * @returns {Array<number>} - Cromosoma hijo
 */
export function crossover(parent1, parent2) {
  const child = parent1.map((w, i) => (w + parent2[i]) / 2);
  return normalizeWeights(child);
}

/**
 * Mutación: ajusta algunos pesos con perturbación aleatoria.
 * @param {Array<number>} chromosome - Cromosoma original
 * @param {number} mutationRate - Probabilidad de mutación por gen
 * @returns {Array<number>} - Cromosoma mutado
 */
export function mutate(chromosome, mutationRate = 0.1) {
  const mutated = chromosome.map(w => {
    if (Math.random() < mutationRate) {
      // perturbación ligera en lugar de reemplazo total
      const delta = (Math.random() - 0.5) * 0.2; // +/- 10%
      return Math.max(w + delta, 0);
    }
    return w;
  });
  return normalizeWeights(mutated);
}
