// src/app/layout.js

export const metadata = {
  title: 'Frontera de Markowitz - Algoritmo Genético',
  description: 'Optimización de carteras con NASDAQ-100',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}