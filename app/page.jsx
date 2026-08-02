// app/page.jsx
"use client";

import { useEffect, useState } from "react";
import { logReturns } from "../lib/finance";
import { runEvolution } from "../lib/evolution";
import Dashboard from "../components/Dashboard";

export default function Home() {
  const [bestFitness, setBestFitness] = useState(null);
  const [distributionData, setDistributionData] = useState([]);
  const [fitnessData, setFitnessData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Llamada al API interno
        const res = await fetch("/api/data", { cache: "no-store" });
        const rawData = await res.json();

        // 2. Procesar datos: convertir precios en retornos logarítmicos
        const assetNames = Object.keys(rawData);
        const assetReturns = assetNames.map(name => logReturns(rawData[name]));

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
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🚀 Optimización de Carteras con Datos Reales NASDAQ</h1>
      {bestFitness !== null ? (
        <>
          <p>Mejor Sharpe Ratio: {bestFitness.toFixed(2)}</p>
          <Dashboard
            fitnessData={fitnessData}
            distributionData={distributionData}
          />
        </>
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
}
