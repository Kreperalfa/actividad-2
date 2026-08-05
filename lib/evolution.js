// lib/evolution.js
// ======================================================
// Ciclo evolutivo completo para optimización de carteras
// ======================================================

import { fitness, tournamentSelection, crossover, mutate, initialPopulation } from "./genetic.js";

/**
 * Ejecuta el algoritmo genético para optimizar carteras.
 * @param {Array<Array<number>>} assetReturns - Retornos de los activos
 * @param {number} numAssets - Número de activos en el portafolio
 * @param {number} populationSize - Tamaño de la población inicial
 * @param {number} generations - Número de generaciones a simular
 * @returns {Object} - Mejor cromosoma, su fitness y evolución histórica
 */
export function runEvolution(assetReturns, numAssets, populationSize = 100, generations = 500) {
  // 1. Crear población inicial
  let population = initialPopulation(populationSize, numAssets);

  // 2. Evaluar fitness inicial
  let fitnessValues = population.map(chrom => {
    let portfolioReturns = combineReturns(chrom, assetReturns);
    return fitness(portfolioReturns, chrom);
  });

  // 3. Guardar mejor solución inicial
  let bestIndex = fitnessValues.indexOf(Math.max(...fitnessValues));
  let bestChromosome = population[bestIndex];
  let bestFitness = fitnessValues[bestIndex];

  // Histórico de fitness por generación
  let fitnessHistory = [bestFitness];

  // 4. Loop de generaciones
  for (let gen = 0; gen < generations; gen++) {
    let newPopulation = [];

    for (let i = 0; i < populationSize; i++) {
      // Selección por torneo
      const parent1 = tournamentSelection(population, fitnessValues);
      const parent2 = tournamentSelection(population, fitnessValues);

      // Cruce y mutación
      let child = crossover(parent1, parent2);
      child = mutate(child);

      newPopulation.push(child);
    }

    // Evaluar nueva población
    fitnessValues = newPopulation.map(chrom => {
      let portfolioReturns = combineReturns(chrom, assetReturns);
      return fitness(portfolioReturns, chrom);
    });

    // Actualizar mejor solución
    let currentBestIndex = fitnessValues.indexOf(Math.max(...fitnessValues));
    let currentBestFitness = fitnessValues[currentBestIndex];

    if (currentBestFitness > bestFitness) {
      bestFitness = currentBestFitness;
      bestChromosome = newPopulation[currentBestIndex];
    }

    // Guardar evolución
    fitnessHistory.push(bestFitness);

    // Reemplazar población
    population = newPopulation;
  }

  return { bestChromosome, bestFitness, fitnessHistory };
}

/**
 * Combina los retornos de los activos según los pesos de un cromosoma.
 * @param {Array<number>} weights - Pesos del portafolio
 * @param {Array<Array<number>>} assetReturns - Retornos de cada activo
 * @returns {Array<number>} - Retornos del portafolio
 */
function combineReturns(weights, assetReturns) {
  let portfolioReturns = [];
  const numDays = assetReturns[0].length;

  for (let day = 0; day < numDays; day++) {
    let dailyReturn = 0;
    for (let asset = 0; asset < weights.length; asset++) {
      dailyReturn += weights[asset] * assetReturns[asset][day];
    }
    portfolioReturns.push(dailyReturn);
  }

  return portfolioReturns;
}

