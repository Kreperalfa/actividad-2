// app/page.jsx
"use client";

import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import styles from "./page.module.css";

export default function Home() {
  const [bestFitness, setBestFitness] = useState(null);
  const [distributionData, setDistributionData] = useState([]);
  const [fitnessData, setFitnessData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Llamada al API interno (ya devuelve todo procesado)
        const res = await fetch("/api/data", { cache: "no-store" });
        const { bestFitness, distributionData, fitnessData } = await res.json();

        // 2. Actualizar estados directamente
        setBestFitness(bestFitness);
        setDistributionData(distributionData);
        setFitnessData(fitnessData);
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
