// components/Dashboard.js
// ======================================================
// Dashboard interactivo para visualizar resultados del portafolio
// ======================================================

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import styles from "./Dashboard.module.css";

// Paleta cromática para genes / activos
const PALETTE = [
  "#4ADE80", "#FBBF24", "#C084FC", "#38BDF8", "#FB7185",
  "#34D399", "#F97316", "#A78BFA", "#2DD4BF", "#F472B6",
];

function FitnessTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>Generación {label}</p>
        <p className={styles.tooltipValue}>{payload[0].value.toFixed(3)}</p>
      </div>
    );
  }
  return null;
}

function DistributionTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{name}</p>
        <p className={styles.tooltipValue}>{(value * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
}

/**
 * Dashboard principal
 * @param {Array<Object>} fitnessData - Datos de evolución del fitness por generación
 * @param {Array<Object>} distributionData - Distribución final de activos
 */
export default function Dashboard({ fitnessData, distributionData }) {
  // Color estable por activo, sin importar el orden en que se recorra la lista
  const colorFor = (name) => {
    const idx = distributionData.findIndex((asset) => asset.name === name);
    return PALETTE[idx % PALETTE.length];
  };

  const sortedByWeight = [...distributionData].sort((a, b) => b.value - a.value);

  return (
    <section className={styles.dashboard}>
      <div className={styles.geneCard}>
        <h2 className={styles.cardTitle}>ADN de la cartera óptima</h2>
        <p className={styles.cardSubtitle}>
          Cada gen es el peso final de un activo dentro del cromosoma ganador.
        </p>

        <div className={styles.geneBar}>
          {sortedByWeight.map((asset) => (
            <div
              key={asset.name}
              className={styles.gene}
              title={`${asset.name}: ${(asset.value * 100).toFixed(1)}%`}
              style={{
                flexGrow: Math.max(asset.value, 0.002),
                backgroundColor: colorFor(asset.name),
              }}
            />
          ))}
        </div>

        <div className={styles.geneLegend}>
          {sortedByWeight.map((asset) => (
            <div key={asset.name} className={styles.geneLegendItem}>
              <span
                className={styles.geneDot}
                style={{ backgroundColor: colorFor(asset.name) }}
              />
              <span className={styles.geneName}>{asset.name}</span>
              <span className={styles.geneValue}>
                {(asset.value * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chartGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Evolución del fitness</h2>
          <p className={styles.cardSubtitle}>Mejor Sharpe Ratio por generación</p>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fitnessData}>
                <defs>
                  <linearGradient id="fitnessGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(234, 243, 238, 0.08)" />
                <XAxis dataKey="generation" stroke="#7E9689" tick={{ fontSize: 12 }} />
                <YAxis stroke="#7E9689" tick={{ fontSize: 12 }} />
                <Tooltip content={<FitnessTooltip />} />
                <Area
                  type="monotone"
                  dataKey="fitness"
                  stroke="#4ADE80"
                  strokeWidth={2}
                  fill="url(#fitnessGradient)"
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Distribución final de activos</h2>
          <p className={styles.cardSubtitle}>Peso de cada activo en la cartera ganadora</p>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={78}
                  outerRadius={135}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {distributionData.map((entry) => (
                    <Cell key={entry.name} fill={colorFor(entry.name)} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<DistributionTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.pieLegend}>
            {distributionData.map((asset) => (
              <span key={asset.name} className={styles.pieLegendItem}>
                <span
                  className={styles.geneDot}
                  style={{ backgroundColor: colorFor(asset.name) }}
                />
                {asset.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}