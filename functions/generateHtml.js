// ───── Archivo: functions/generateHtml.js ─────
// Función auxiliar para generar el HTML del informe financiero PDF

function generateHtmlForReport(period, summary = {}, categories = {}, user = {}) {
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Sin nombre';

  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 2rem;
            background-color: #f9f9f9;
            color: #333;
          }
          h1, h2 {
            color: #222;
          }
          p {
            font-size: 16px;
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: left;
            font-size: 14px;
          }
          th {
            background-color: #eee;
          }
        </style>
      </head>
      <body>
        <h1>Informe Financiero – ${period}</h1>
        <p><strong>Usuario:</strong> ${fullName}</p>

        <h2>Resumen</h2>
        <p><strong>Ingresos:</strong> €${summary.totalIncomes ?? 0}</p>
        <p><strong>Gastos:</strong> €${summary.totalExpenses ?? 0}</p>

        <h2>Gastos por Categoría</h2>
        <table>
          <thead>
            <tr><th>Categoría</th><th>Total (€)</th></tr>
          </thead>
          <tbody>
            ${Object.entries(categories.groups || {}).map(([cat, value]) =>
              `<tr><td>${cat}</td><td>${value}</td></tr>`
            ).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
}


module.exports = { generateHtmlForReport };
