// generateChart.js - Generador de gráficos compatibles con backend (Node.js)

const QuickChart = require('quickchart-js');

/**
 * Genera una URL para un gráfico de pastel (pie chart) con los datos de categoría.
 * @param {Object} categoryData - Objeto con categorías como claves y valores numéricos.
 * @returns {Promise<string>} - URL del gráfico de pastel generado.
 */
async function generatePieChartSVG(categoryData) {
  const labels = Object.keys(categoryData);
  const values = Object.values(categoryData);

  const chart = new QuickChart();
  chart.setConfig({
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#5AD45A', '#FF6B6B', '#C9CBCF'
          ]
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Distribución por Categoría'
        }
      }
    }
  });

  // Puedes usar .toDataUrl() para incrustar como base64 en HTML directamente
  // const url = await chart.toDataUrl();

  return chart.getShortUrl();
}

module.exports = { generatePieChartSVG };
