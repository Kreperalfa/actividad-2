// components/Dashboard.js
// ======================================================
// Dashboard interactivo para visualizar resultados del portafolio
// ======================================================

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

// Colores para la gráfica de distribución de activos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF", "#FF6F61", "#4CAF50", "#E91E63", "#9C27B0", "#FFC107"];

/**
 * Dashboard principal
 * @param {Array<Object>} fitnessData - Datos de evolución del fitness por generación
 * @param {Array<Object>} distributionData - Distribución final de activos
 */
export default function Dashboard({ fitnessData, distributionData }) {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>📈 Evolución del Fitness (Sharpe Ratio)</h2>
      <LineChart width={600} height={300} data={fitnessData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="generation" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="fitness" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>

      <h2 style={{ marginTop: "3rem" }}>🥧 Distribución Final de Activos</h2>
      <PieChart width={600} height={400}>
        <Pie
          data={distributionData}
          cx={300}
          cy={200}
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
        >
          {distributionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
}
