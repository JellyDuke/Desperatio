
const API_URL = "https://entryon-finnhub-proxy.vercel.app/api/finnhub";

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("symbol-input");
  const button = document.getElementById("symbol-submit");
  const canvas = document.getElementById("stockChart");

  if (!input || !button || !canvas) {
    console.error("입력창 또는 버튼 또는 차트 캔버스를 찾을 수 없습니다.");
    return;
  }

  button.addEventListener("click", async () => {
    const symbol = input.value.trim().toUpperCase();
    if (!symbol) {
      alert("종목 티커를 입력해주세요 (예: AAPL, TSLA)");
      return;
    }

    try {
      const res = await fetch(`${API_URL}?symbol=${symbol}`);
      const data = await res.json();

      if (data.s !== "ok") {
        alert("차트 데이터를 불러올 수 없습니다.");
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
            fill: true,
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

    } catch (err) {
      console.error("API 호출 오류:", err);
      alert("서버 오류가 발생했습니다.");
    }
  });
});

