const input = document.getElementById("symbol-input");
const button = document.getElementById("load-chart-btn");
const container = document.getElementById("tradingview-container");

async function loadChart() {
  const symbol = input.value.trim().toUpperCase();
  if (!symbol) {
    alert("티커를 입력하세요. 예: AAPL, TSLA, AMEX:BITO");
    return;
  }

  // ✅ TradingView 차트 표시
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

  // ✅ TwelveData 프록시 호출
  const res = await fetch(`https://twelvedata-proxy.vercel.app/api/twelvedata?symbol=${symbol}`);
  const data = await res.json();

  // ✅ 기술적 지표 12종
  const indicators = [
    {
      label: "RSI(14)",
      value: parseFloat(data.rsi?.value),
      판단: (v) => v < 30 ? "매수" : v > 70 ? "매도" : "중립"
    },
    {
      label: "STOCH(9,6)",
      value: parseFloat(data.stochastic?.slow_k),
      판단: (v) => v < 20 ? "과매도" : v > 80 ? "과매수" : "중립"
    },
    {
      label: "STOCHRSI(14)",
      value: parseFloat(data.stochrsi?.stochrsi),
      판단: (v) => v < 0.2 ? "과매도" : v > 0.8 ? "과매수" : "중립"
    },
    {
      label: "MACD(12,26)",
      value: parseFloat(data.macd?.macd),
      signal: parseFloat(data.macd?.signal),
      판단: (v, s) => v > s ? "매수" : "매도"
    },
    {
      label: "ADX(14)",
      value: parseFloat(data.adx?.adx),
      판단: (v) => v >= 25 ? "강한 추세" : "약한 추세"
    },
    {
      label: "Williams %R",
      value: parseFloat(data.willr?.willr),
      판단: (v) => v > -20 ? "과매수" : v < -80 ? "과매도" : "중립"
    },
    {
      label: "CCI(14)",
      value: parseFloat(data.cci?.cci),
      판단: (v) => v > 100 ? "과매수" : v < -100 ? "과매도" : "중립"
    },
    {
      label: "ATR(14)",
      value: parseFloat(data.atr?.atr),
      판단: (_) => "변동성 높음"
    },
    {
      label: "Highs/Lows(14)",
      value: parseFloat(data.highs_lows?.highs_lows),
      판단: (_) => "추세 확인"
    },
    {
      label: "Ultimate Oscillator",
      value: parseFloat(data.ultimate_oscillator?.ultimate_oscillator),
      판단: (v) => v < 30 ? "매수" : v > 70 ? "매도" : "중립"
    },
    {
      label: "ROC",
      value: parseFloat(data.roc?.roc),
      판단: (v) => v > 0 ? "매수" : "매도"
    },
    {
      label: "Bull/Bear Power(13)",
      value: parseFloat(data.bull_bear_power?.bull_bear_power),
      판단: (v) => v > 0 ? "매수" : "매도"
    }
  ];

  // ✅ Webflow 구조에 수치 + 판단 삽입
  const resultBlocks = document.querySelectorAll('.list-i');

  indicators.forEach((indicator, idx) => {
    const item = resultBlocks[idx];
    if (!item) return;

    const 판단 = indicator.signal !== undefined
      ? indicator.판단(indicator.value, indicator.signal)
      : indicator.판단(indicator.value);

    const valueText = isNaN(indicator.value) ? "-" : indicator.value.toFixed(2);

    // 📌 .list-r 안의 텍스트 박스 2개: [0] 수치, [1] 판단
    const textBlocks = item.querySelectorAll('.list-r .w-richtext, .list-r .textblock, .list-r div');
    if (textBlocks[0]) textBlocks[0].textContent = valueText;
    if (textBlocks[1]) textBlocks[1].textContent = 판단;
  });
}

button.addEventListener("click", loadChart);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadChart();
});