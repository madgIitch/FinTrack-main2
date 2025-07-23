// ───── Archivo: functions/generateHtml.js ─────

function generateHtmlForReport(
  period,
  summary = {},
  categories = {},
  limits = {},
  user = {},
  pieChartImg = '',
  barChartImg = '',
  lineChartImg = ''
) {
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Sin nombre';
  const now = new Date();
  const generatedAt = now.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });

  const ingresos = Math.round(summary.totalIncomes ?? 0);
  const gastos = Math.round(summary.totalExpenses ?? 0);
  const balance = ingresos - gastos;
  const balanceStr = balance >= 0
    ? `<span style="color:#27ae60;">superávit de €${balance}</span>`
    : `<span style="color:#c0392b;">déficit de €${Math.abs(balance)}</span>`;

  const logoBase64 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iMTAyNC4wMDAwMDBwdCIgaGVpZ2h0PSIxMDI0LjAwMDAwMHB0IiB2aWV3Qm94PSIwIDAgMTAyNC4wMDAwMDAgMTAyNC4wMDAwMDAiCiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij4KCjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLDEwMjQuMDAwMDAwKSBzY2FsZSgwLjEwMDAwMCwtMC4xMDAwMDApIgpmaWxsPSIjMDAwMDAwIiBzdHJva2U9Im5vbmUiPgo8cGF0aCBkPSJNNDkzNSA4MzAwIGMtNTc1IC01OSAtMTExMiAtMjc1IC0xNTQ4IC02MjYgLTI1MSAtMjAxIC00MTUgLTM4MwotNTkzIC02NTUgLTI2OCAtNDEzIC00MzEgLTg2OCAtNDc1IC0xMzI0IC0xNSAtMTU2IC0xNSAtNDcyIDAgLTYwNSAzMyAtMjk3CjEyNyAtNjIwIDI1OSAtODk0IDEwNCAtMjEzIDE1OSAtMzA1IDMwNiAtNTAxIDI1NSAtMzQyIDU3NyAtNjEwIDk3MSAtODEyIDIxOQotMTExIDM0MyAtMTYxIDU0MiAtMjE5IDQwMCAtMTE1IDgzMCAtMTQ3IDEyMDMgLTg5IDM5NSA2MSA2MzAgMTM2IDk1OSAzMDYKNDUzIDIzNCA3NzggNTI2IDEwNzYgOTY5IDI0NiAzNjQgNDAyIDc5MiA0NTYgMTI0NSAxNiAxMzEgMTYgNDc4IDAgNjMwIC0yMgoyMTggLTkwIDUwMiAtMTY4IDcwNSAtMTA0IDI3MCAtMzI4IDY1MSAtNTExIDg3MCAtMjQ2IDI5MyAtNTY0IDU0MSAtOTE3IDcxNAotMjg4IDE0MiAtNTY3IDIyNiAtODkwIDI3MSAtMTMyIDE5IC01NDMgMjcgLTY3MCAxNXogbTYwMiAtNDk1IGMxNDUgLTE5IDI4MAotNTEgNDQzIC0xMDYgNTA4IC0xNjkgOTA0IC00NjggMTIyNyAtOTI0IDI5NiAtNDE5IDQ0MCAtOTE1IDQxOSAtMTQ0NCAtMTQKLTM1NyAtNzUgLTYxNyAtMjIwIC05MzQgLTE4NCAtNDAxIC01NDEgLTc5NiAtOTQxIC0xMDQwIC00NTkgLTI3OSAtOTcxIC0zOTkKLTE0NTkgLTM0MiAtNTMyIDYyIC05NzcgMjQ4IC0xMzU4IDU2NyAtNDcwIDM5NCAtNzQ3IDg3MCAtODQ1IDE0NTMgLTIyIDEzNQotMjUgNTU1IC01IDcwMCA0MSAyOTAgMTU5IDYzMyAzMDAgODc1IDE2MiAyNzcgMzc5IDUzMCA1OTggNjk3IDM1OSAyNzMgNzYzCjQzOSAxMjI0IDUwMiAxMTIgMTUgNDg3IDEzIDYxNyAtNHoiLz4KPHBhdGggZD0iTTUwMjUgNzU2NCBjLTUxMSAtNTMgLTEwMTUgLTI4NiAtMTM1OSAtNjMwIC0yNTcgLTI1OCAtNDU0IC01ODkKLTU1MCAtOTI3IC0xNjAgLTU2MCAtODkgLTExNTYgMTk3IC0xNjUyIDI0MiAtNDIwIDYzNyAtNzU3IDExMTMgLTk1MCAxMTIgLTQ1CjQ0MSAtMTI5IDU2NSAtMTQ1IDUyIC02IDE0NCAtMTAgMjA0IC04IGwxMTAgMyA2IDI5NyBjMyAxNjQgOCAzMDAgMTEgMzAzIDMgNAoyOSAtMSA1NyAtMTEgNTAgLTE2IDEwOCAtMTUgMTY3IDIgMjAgNSAyMSAxIDI3IC04NyA0IC01MSA3IC0xODIgNyAtMjkxIDAKLTE5OSAwIC0xOTkgMjEgLTE5MyAxMiA0IDU4IDE3IDEwMyAzMCA0NCAxMiAxMTggMzMgMTYzIDQ1IGw4MSAyMyAyIDgyNSBjMAo0NTUgMyA4MjggNSA4MzAgMyAzIDExIDAgMTkgLTcgMjYgLTIyIDEyMiAtMzEgMTc2IC0xNyBsNTAgMTMgMCAtNzU4IGMwIC01NjcKMyAtNzU5IDEyIC03NTkgMTcgMCAxMjAgNjEgMjQ4IDE0NyBsMTE1IDc4IDUgMTA5NyBjMyA2MDMgOCAxMTAwIDEyIDExMDQgNCA0CjI4IDEgNTMgLTYgMzAgLTggNzIgLTExIDEyMyAtNiBsNzcgNiAwIC05NTIgYzAgLTcyOSAzIC05NTIgMTIgLTk1NSAxOCAtNgoyMTkgMjY5IDI2OCAzNjggOTMgMTg0IDE3OCA0NDIgMjE3IDY1NCAxOSAxMDMgMjIgMTU4IDIyIDM4NSAxIDI4MyAtMiAzMTAKLTU1IDUyOSAtOTEgMzcyIC0zMjMgNzU3IC02MjcgMTA0MSAtMTQ2IDEzNSAtMjEyIDE4NyAtMzM5IDI2MyAtMjY1IDE1OSAtNDc2CjIzOCAtNzc4IDI5MyAtODcgMTUgLTQ0NiAyNyAtNTQwIDE4eiBtMzQzIC00NjAgYzQ0MSAtNDQgODcxIC0zOTMgODcyIC03MDcgMAotNTcgLTI1IC05OSAtNzIgLTEyMyAtNDIgLTIyIC0xNDIgLTM1IC0yMDQgLTI4IGwtNTIgNiAtODIgMTA5IGMtMTQxIDE5MAotMjkzIDI4MiAtNDg2IDI5NiAtMTg4IDE0IC0zNDIgLTQxIC00NzkgLTE2OSAtODQgLTc4IC0xMjggLTE0MiAtMTYzIC0yMzYKLTIxIC01NyAtMjUgLTg3IC0yOCAtMjA3IGwtMyAtMTQwIDI3NyAzIGMzMDkgNCAzNzUgLTMgNDM3IC00NiA1NyAtNDAgNzcgLTc5Cjc2IC0xNTMgMCAtNzMgLTI4IC0xMjMgLTkxIC0xNjUgLTU3IC0zOCAtMTUxIC00NiAtNDQ3IC0zOCBsLTI1MyA3IDAgLTU5IGMwCi0zMyAzIC05NSA2IC0xMzkgbDcgLTgwIDMwNiAwIGMyOTQgMCAzMDggLTEgMzQ2IC0yMiA4MCAtNDMgMTI4IC0xMTcgMTI3Ci0xOTggLTEgLTYzIC0yMSAtMTExIC02NCAtMTUxIC02MiAtNTkgLTU2IC01OCAtNDAyIC01OSBsLTMxOSAwIDIgLTM1NiBjMwotMzk2IDMgLTM5NyAtNjQgLTQ2MiAtNzkgLTc3IC0xNzEgLTk2IC0yNTkgLTUzIC01NyAyOCAtODkgNjUgLTEyOCAxNTEgLTIyCjQ5IC0yMyA2MCAtMjYgMzg5IGwtMyAzMzkgLTE4NyAtNyBjLTE1MiAtNSAtMTk2IC00IC0yMzcgOCAtMTIxIDM3IC0xOTIgMTk0Ci0xMzYgMzA0IDIzIDQ1IDQyIDYyIDEwMSA5MyA0MyAyMyA1NCAyNCAyNTIgMjQgbDIwNyAwIDMgMTMyIDMgMTMxIC04NSA3CmMtNDcgMyAtMTQ0IDUgLTIxNiAzIC0xMjkgLTMgLTEzMSAtMiAtMTczIDI1IC00NyAzMSAtOTggMTA0IC0xMDcgMTUzIC0xMyA2OAo0MCAxNTQgMTIwIDE5NyAzOCAyMSA1NCAyMiAyNDcgMjIgbDIwNyAwIDUgMTcwIGM5IDI4MSA2MCA0NDggMTkzIDYyNyAxNzQKMjMzIDQzNCAzNzggNzI5IDQwOCA3NyA3IDEyMSA2IDI0MyAtNnogbTEzOTYgLTgwNCBjNDMgLTE2IDEwNSAtODAgMTE3IC0xMjAKMTAgLTMyIDkgLTQ0IC03IC03NyAtMjIgLTQzIC04OCAtODMgLTE0MCAtODMgLTQ5IDAgLTExNiAzMyAtMTUzIDc1IC0yOSAzMwotMzMgNDMgLTI4IDc4IDEzIDk5IDExOSAxNjIgMjExIDEyN3ogbS01OTIgLTkwMCBjODQgLTU2IDEwMCAtMTQxIDM4IC0yMDUKLTQyIC00MyAtOTUgLTU4IC0xNTUgLTQ1IC05NSAyMSAtMTQ1IDY2IC0xNDUgMTI5IDAgMTI5IDE0NyAxOTcgMjYyIDEyMXoKbS02ODQgLTEwODYgYzEwMCAtNDEgMTUxIC0xNDggMTA2IC0yMjMgLTIwIC0zNCAtNzcgLTcxIC0xMjAgLTc4IC00NiAtOCAtMTI2CjIzIC0xNjkgNjUgLTMwIDMwIC0zNSA0MSAtMzUgODIgMCA2MCA0MCAxMTggMTAxIDE0OCA1MiAyNiA2OCAyNyAxMTcgNnoiLz4KPC9nPgo8L3N2Zz4K';

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
          .chart-container img {
            max-width: 480px;
            height: auto;
          }
        </style>
      </head>
      <body>
        <header>
          <img src="${logoBase64}" alt="FinTrack Logo" />
          <h1>Informe Financiero – ${period}</h1>
        </header>

        <p><strong>👤 Usuario:</strong> ${fullName}</p>
        <p><strong>🗕️ Generado el:</strong> ${generatedAt}</p>

        <div class="highlight">
          <p>Este mes has recibido <strong>€${ingresos}</strong> y has gastado <strong>€${gastos}</strong>. El resultado ha sido un <strong>${balanceStr}</strong>.</p>
        </div>

        <h2>📊 Distribución de Gastos</h2>
        <div class="chart-container">
          ${pieChartImg
            ? `<img src="${pieChartImg}" alt="Gráfico de Categorías" />`
            : '<p>No se pudo generar el gráfico de pastel.</p>'}
        </div>

        <h2>📈 Evolución del Mes</h2>
        <div class="chart-container">
          ${lineChartImg
            ? `<img src="${lineChartImg}" alt="Gráfico de Líneas Ingresos/Gastos" />`
            : '<p>No se pudo generar el gráfico de líneas.</p>'}
        </div>

        <h2 style="page-break-before: always;">📉 Salario Neto</h2>
        <div class="chart-container">
          ${barChartImg
            ? `<img src="${barChartImg}" alt="Gráfico de Barras por Grupo" />`
            : '<p>No se pudo generar el gráfico de barras.</p>'}
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
                  <td>€${Math.round(val)}</td>
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
                  <td>€${Math.round(data.spent)}</td>
                  <td>€${Math.round(data.limit)}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>

      </body>
    </html>
  `;
}

module.exports = { generateHtmlForReport };
