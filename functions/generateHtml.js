// ───── Archivo: functions/generateHtml.js ─────

function generateHtmlForReport(period, summary = {}, categories = {}, limits = {}, user = {}, pieChartSVG = '') {
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Sin nombre';
  const now = new Date();
  const generatedAt = now.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });

  const ingresos = (summary.totalIncomes ?? 0).toFixed(2);
  const gastos = (summary.totalExpenses ?? 0).toFixed(2);
  const balance = (summary.totalIncomes ?? 0) - (summary.totalExpenses ?? 0);
  const balanceStr = balance >= 0
    ? `<span style="color:#27ae60;">superávit de €${balance.toFixed(2)}</span>`
    : `<span style="color:#c0392b;">déficit de €${Math.abs(balance).toFixed(2)}</span>`;

  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Informe ${period}</title>
        <style>
          body {
            font-family: 'Segoe UI', Roboto, sans-serif;
            padding: 2.5rem;
            background-color: #fcfcfd;
            color: #2c3e50;
            font-size: 16px;
          }

          header {
            display: flex;
            align-items: center;
            margin-bottom: 2rem;
          }

          header img {
            height: 42px;
            margin-right: 1rem;
          }

          h1 {
            font-size: 26px;
            margin: 0;
            color: #34495e;
          }

          h2 {
            font-size: 20px;
            margin-top: 2rem;
            margin-bottom: 0.5rem;
            border-bottom: 2px solid #ddd;
            padding-bottom: 4px;
          }

          p {
            margin: 6px 0;
            line-height: 1.6;
          }

          .highlight {
            background-color: #e8f8f5;
            padding: 1rem;
            border-left: 5px solid #1abc9c;
            margin-top: 1rem;
            border-radius: 6px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
            border: 1px solid #ccc;
          }

          th {
            background-color: #2980b9;
            color: white;
            text-align: left;
            padding: 10px;
          }

          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }

          tr:nth-child(even) {
            background-color: #f5fafd;
          }

          .footer {
            margin-top: 3rem;
            text-align: center;
            font-size: 13px;
            color: #888;
          }

          .small-note {
            font-size: 13px;
            margin-top: 0.5rem;
            color: #777;
          }

          .chart-container {
            margin-top: 2rem;
            text-align: center;
          }

          .chart-container svg {
            max-width: 480px;
            height: auto;
          }
        </style>
      </head>

      <body>
        <header>
          <img src="https://fintrack-assets.s3.eu-west-1.amazonaws.com/logo-mini.svg" alt="FinTrack Logo" />
          <h1>Informe Financiero – ${period}</h1>
        </header>

        <p><strong>👤 Usuario:</strong> ${fullName}</p>
        <p><strong>📅 Generado el:</strong> ${generatedAt}</p>

        <div class="highlight">
          <p>Este mes has recibido <strong>€${ingresos}</strong> y has gastado <strong>€${gastos}</strong>. El resultado ha sido un <strong>${balanceStr}</strong>.</p>
        </div>

        <h2>📊 Distribución de Gastos</h2>
        <div class="chart-container">
          ${pieChartSVG || '<p>No se pudo generar el gráfico.</p>'}
        </div>

        <h2>📌 Detalle de Gastos por Categoría</h2>
        <table>
          <thead>
            <tr><th>Categoría</th><th>Total (€)</th></tr>
          </thead>
          <tbody>
            ${Object.entries(categories)
              .filter(([_, val]) => typeof val === 'number')
              .map(([cat, val]) => `
                <tr>
                  <td>${cat}</td>
                  <td>€${val.toFixed(2)}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>

        <h2>🧮 Presupuestos y Límites</h2>
        <table>
          <thead>
            <tr><th>Grupo</th><th>Gasto (€)</th><th>Límite (€)</th></tr>
          </thead>
          <tbody>
            ${Object.entries(limits)
              .map(([group, data]) => `
                <tr>
                  <td>${group}</td>
                  <td>€${data.spent.toFixed(2)}</td>
                  <td>€${data.limit.toFixed(2)}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Informe generado automáticamente por <strong>FinTrack</strong><br/>
          <div class="small-note">Finanzas claras. Vida tranquila. 💸</div>
        </div>
      </body>
    </html>
  `;
}

module.exports = { generateHtmlForReport };
