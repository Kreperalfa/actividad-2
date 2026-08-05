// app/page.jsx
"use client";

import { useEffect, useState } from "react";
import { logReturns } from "../lib/finance";
import { runEvolution } from "../lib/evolution";
import Dashboard from "../components/dashboard";
import styles from "./page.module.css";

export default function Home() {
  const [bestFitness, setBestFitness] = useState(null);
  const [distributionData, setDistributionData] = useState([]);
  const [fitnessData, setFitnessData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Llamada al API interno
        const res = await fetch("/api/data", { cache: "no-store" });
        const rawData = await res.json();

        // 2. Procesar datos: convertir precios en retornos logarítmicos
        const rawAssetNames = Object.keys(rawData);
        const rawAssetReturns = rawAssetNames.map(name => logReturns(rawData[name]));

        // 2.1 Descartar activos sin datos (ticker que falló en /api/data)
        const validIdx = rawAssetReturns
          .map((r, i) => (r.length > 0 ? i : -1))
          .filter(i => i !== -1);

        if (validIdx.length < 2) {
          throw new Error("No hay suficientes activos con datos válidos para optimizar.");
        }

        const assetNames = validIdx.map(i => rawAssetNames[i]);
        const validReturns = validIdx.map(i => rawAssetReturns[i]);

        // 2.2 Igualar longitudes: si algún activo trae menos días que otros
        // (halts, splits, diferencias de calendario en Yahoo), recortamos
        // todos al mínimo común para que combineReturns() no indexe fuera
        // de rango y termine metiendo NaN en el fitness.
        const minLen = Math.min(...validReturns.map(r => r.length));
        const assetReturns = validReturns.map(r => r.slice(-minLen));

        // 3. Ejecutar el motor evolutivo
        const { bestChromosome, bestFitness, fitnessHistory } = runEvolution(
          assetReturns,
          assetNames.length
        );

        // Transformar fitnessHistory en datos para la gráfica
        const fitnessDataFormatted = fitnessHistory.map((value, index) => ({
          generation: index,
          fitness: value,
        }));

        // 4. Preparar datos para el Dashboard
        const distributionData = assetNames.map((name, i) => ({
          name,
          value: bestChromosome[i],
        }));

        // 5. Actualizar estados
        setBestFitness(bestFitness);
        setDistributionData(distributionData);
        setFitnessData(fitnessDataFormatted);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("No se pudieron cargar los datos de mercado. Intenta de nuevo más tarde.");
      }
    }

    fetchData();
  }, []);

  const isLoading = bestFitness === null && !error;

  return (
    <main className={styles.page}>
      <div className={styles.backdrop} aria-hidden="true" />

      <header className={styles.hero}>
        <span className={styles.eyebrow}>Motor evolutivo · NASDAQ-100</span>
        <h1 className={styles.title}>Frontera de Markowitz</h1>
        <p className={styles.subtitle}>
          Un algoritmo genético cruza y muta carteras generación tras generación
          hasta converger en la combinación de activos con el mejor retorno
          ajustado al riesgo.
        </p>

        {isLoading && (
          <div className={styles.loadingState}>
            <span className={styles.pulseDot} />
            <span className={styles.pulseDot} />
            <span className={styles.pulseDot} />
            <span>Descargando precios y evolucionando la población...</span>
          </div>
        )}

        {error && <p className={styles.errorState}>{error}</p>}

        {!isLoading && !error && (
          <div className={styles.statTrio}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Sharpe Ratio</span>
              <span className={styles.statValue}>{bestFitness.toFixed(2)}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Activos evaluados</span>
              <span className={styles.statValue}>{distributionData.length}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Generaciones</span>
              <span className={styles.statValue}>{Math.max(fitnessData.length - 1, 0)}</span>
            </div>
          </div>
        )}
      </header>

      {!isLoading && !error && (
        <Dashboard fitnessData={fitnessData} distributionData={distributionData} />
      )}
    </main>
  );
}