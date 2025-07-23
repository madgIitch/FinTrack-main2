// ───── Archivo: functions/generateChart.js ─────

const QuickChart = require('quickchart-js');

// ───── Colores por grupo de categoría ─────
const groupColors = {
  'Agricultura y Medio Ambiente': '#A8D5BA',
  'Alimentos y Restauración': '#FFB6B9',
  'Arte y Cultura': '#D2B4F8',
  'Automoción y Transporte': '#B4C5F8',
  'Belleza y Cuidado Personal': '#FDC5F5',
  'Bienes Raíces y Vivienda': '#B0EACD',
  'Compras y Retail': '#FFE29A',
  'Deportes y Recreación': '#FFDAC1',
  'Educación y Capacitación': '#C3FBD8',
  'Entretenimiento y Ocio': '#D8C2FF',
  'Eventos y Celebraciones': '#FFD6A5',
  'Finanzas y Seguros': '#E6C9A8',
  'Gobierno y Servicios Públicos': '#BCD9EA',
  'Hogar y Jardín': '#F3F798',
  'Industrial y Manufactura': '#F2C6DE',
  'Mascotas y Animales': '#C5C6F1',
  'Otros': '#D9D9D9',
  'Religión y Comunidad': '#FAD4C0',
  'Salud y Medicina': '#C9F2F2',
  'Servicios Profesionales': '#E4BAD4',
  'Tecnología e Internet': '#B0D9F8',
  'Viajes y Hostelería': '#FFC9DE',
  'Loan Payments': '#B0BEC5'
};

/**
 * Genera un gráfico de pastel (pie chart) y lo devuelve como imagen base64.
 * @param {Object} categoryData - Objeto con categorías como claves y valores numéricos.
 * @returns {Promise<string>} - Cadena base64 como src de imagen (data:image/png;base64,...)
 */
async function generatePieChartBase64(categoryData) {
  const labels = Object.keys(categoryData);
  const values = Object.values(categoryData).map(v => Math.round(v));

  // Colores según grupo de categoría
  const backgroundColor = labels.map(cat => groupColors[cat] || '#D9D9D9');

  const chart = new QuickChart();
  chart.setWidth(480);
  chart.setHeight(320);
  chart.setFormat('png');

  chart.setConfig({
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor
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
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: €${Math.round(context.raw)}`;
            }
          }
        }
      }
    }
  });

  try {
    const buffer = await chart.toBinary();
    const base64 = buffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('[CHART] ❌ Error generando gráfico base64:', error.message);
    return '';
  }
}

// INGRESOS vs GASTOS por semana
async function generateLineChartBase64(weeks, incomeValues, expenseValues) {
  const chart = new QuickChart();
  chart.setWidth(600).setHeight(320).setFormat('png');

  chart.setConfig({
    type: 'line',
    data: {
      labels: weeks,
      datasets: [
        {
          label: 'Ingresos',
          data: incomeValues.map(v => Math.round(v)),
          borderColor: '#4ADE80',
          backgroundColor: '#4ADE80',
          fill: false,
          tension: 0.4
        },
        {
          label: 'Gastos',
          data: expenseValues.map(v => Math.round(v)),
          borderColor: '#F87171',
          backgroundColor: '#F87171',
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      plugins: {
        title: { display: true, text: 'Evolución semanal de Ingresos y Gastos' },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: €${ctx.raw}`
          }
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  try {
    const buffer = await chart.toBinary();
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch (err) {
    console.error('[CHART] ❌ Error generando gráfico de línea:', err);
    return '';
  }
}

// SALARIO NETO = Ingresos - Gastos por semana
async function generateBarChartBase64(weeks, incomeValues, expenseValues) {
  // Validación de arrays
  if (!Array.isArray(weeks) || !Array.isArray(incomeValues) || !Array.isArray(expenseValues)) {
    console.error('[CHART] ❌ Parámetros inválidos para generateBarChartBase64:', {
      weeks, incomeValues, expenseValues
    });
    return '';
  }

  const neto = incomeValues.map((val, i) => Math.round(val - (expenseValues[i] || 0)));

  const chart = new QuickChart();
  chart.setWidth(600).setHeight(320).setFormat('png');

  chart.setConfig({
    type: 'bar',
    data: {
      labels: weeks,
      datasets: [{
        label: 'Salario Neto',
        data: neto,
        backgroundColor: '#60A5FA'
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: 'Salario Neto por Semana' },
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `€${ctx.raw}`
          }
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  try {
    const buffer = await chart.toBinary();
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch (err) {
    console.error('[CHART] ❌ Error generando gráfico de barras (neto):', err);
    return '';
  }
}


module.exports = { generatePieChartBase64, generateBarChartBase64, generateLineChartBase64 };
