
const API_KEY = "d00fen1r01qk939nqohgd00fen1r01qk939nqoi0"; // 당신의 Finnhub API 키

document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector("#symbol-input");
  const button = document.querySelector("#symbol-submit");
  const canvas = document.getElementById("stockChart");

  if (!input || !button || !canvas) return;

  button.addEventListener("click", async () => {
    const symbol = input.value.trim().toUpperCase();
    if (!symbol) {
      alert("종목을 입력해주세요.");
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const from = now - 60 * 60 * 24 * 90; // 최근 90일

    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${now}&token=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.s !== "ok") {
      alert("차트 데이터를 불러오지 못했습니다.");
      return;
    }

    const labels = data.t.map(ts => new Date(ts * 1000).toLocaleDateString());
    const closes = data.c;

    const ctx = canvas.getContext("2d");
    if (window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${symbol} 종가`,
          data: closes,
          borderColor: '#36a2eb',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { display: true },
          y: { display: true }
        }
      }
    });
  });
});
