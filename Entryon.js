const input = document.getElementById("symbol-input");
  const button = document.getElementById("load-chart-btn");
  const container = document.getElementById("tradingview-container");

  async function loadChart() {
    const symbol = input.value.trim().toUpperCase();
    if (!symbol) {
      alert("티커를 입력하세요. 예: AAPL, TSLA, AMEX:BITO");
      return;
    }

    // 📈 TradingView 차트 표시
    container.innerHTML = "";
    new TradingView.widget({
      container_id: "tradingview-container",
      width: "100%",
      height: 500,
      symbol: symbol,
      interval: "D",
      timezone: "Asia/Seoul",
      theme: "light",
      style: "1",
      locale: "kr",
      toolbar_bg: "#f1f3f6",
      enable_publishing: false,
      allow_symbol_change: true,
      hide_top_toolbar: false
    });

    // 📡 Finnhub 프록시 호출 (🔥 실제 URL로 수정됨)
    const res = await fetch(`https://api-proxy-drab-one.vercel.app/api/finnhub?symbol=${symbol}&indicators=rsi,macd,adx`);
    const data = await res.json();
    console.log("📦 API 응답:", data);

    // 📊 지표 목록 정의
    const indicators = [
      {
        label: "RSI(14)",
        value: parseFloat(data.rsi?.rsi?.at(-1)),
        판단: (v) => v < 30 ? "매수" : v > 70 ? "매도" : "중립"
      },
      {
        label: "MACD(12,26)",
        value: parseFloat(data.macd?.macd?.at(-1)),
        signal: parseFloat(data.macd?.signal?.at(-1)),
        판단: (v, s) => v > s ? "매수" : "매도"
      },
      {
        label: "ADX(14)",
        value: parseFloat(data.adx?.adx?.at(-1)),
        판단: (v) => v >= 25 ? "강한 추세" : "약한 추세"
      }
    ];

    // 🧾 결과 출력ss
    const resultBlocks = document.querySelectorAll('.list-i');

    indicators.forEach((indicator, idx) => {
      const item = resultBlocks[idx];
      if (!item) return;

      const valueText = isNaN(indicator.value) ? "-" : indicator.value.toFixed(2);
      const 판단 = (indicator.signal !== undefined && !isNaN(indicator.signal))
        ? indicator.판단(indicator.value, indicator.signal)
        : indicator.판단(indicator.value);

      const textBlocks = item.querySelectorAll('.list-r .w-richtext, .list-r .TextBlock, .list-r div');
      if (textBlocks[0]) textBlocks[0].textContent = valueText;
      if (textBlocks[1]) textBlocks[1].textContent = 판단;
    });
  }

  // ✅ 버튼 + 엔터 키 입력 처리
  button.addEventListener("click", loadChart);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadChart();
  });