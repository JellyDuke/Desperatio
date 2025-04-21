const input = document.getElementById("symbol-input");
const button = document.getElementById("load-chart-btn");
const container = document.getElementById("tradingview-container");

async function loadChart() {
  const symbol = input.value.trim().toUpperCase();
  if (!symbol) {
    alert("티커를 입력하세요. 예: AAPL, TSLA, AMEX:BITO");
    return;
  }

  // 📈 TradingView 차트
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

  // 📡 프록시 API 호출
  const res = await fetch(`https://twelvedata-proxy.vercel.app/api/twelvedata?symbol=${symbol}`);
  const data = await res.json();
  console.log("📦 API 응답:", data);

  const indicators = [
    {
      label: "RSI(14)",
      value: parseFloat(data.rsi?.values?.[0]?.value),
      status: data.rsi?.status,
      판단: (v) => v < 30 ? "매수" : v > 70 ? "매도" : "중립"
    },
    {
      label: "STOCH(9,6)",
      value: parseFloat(data.stochastic?.values?.[0]?.slow_k),
      status: data.stochastic?.status,
      판단: (v) => v < 20 ? "과매도" : v > 80 ? "과매수" : "중립"
    },
    {
      label: "STOCHRSI(14)",
      value: parseFloat(data.stochrsi?.values?.[0]?.stochrsi),
      status: data.stochrsi?.status,
      판단: (v) => v < 0.2 ? "과매도" : v > 0.8 ? "과매수" : "중립"
    },
    {
      label: "MACD(12,26)",
      value: parseFloat(data.macd?.values?.[0]?.macd),
      signal: parseFloat(data.macd?.values?.[0]?.signal),
      status: data.macd?.status,
      판단: (v, s) => v > s ? "매수" : "매도"
    },
    {
      label: "ADX(14)",
      value: parseFloat(data.adx?.values?.[0]?.adx),
      status: data.adx?.status,
      판단: (v) => v >= 25 ? "강한 추세" : "약한 추세"
    },
    {
      label: "Williams %R",
      value: parseFloat(data.willr?.values?.[0]?.willr),
      status: data.willr?.status,
      판단: (v) => v > -20 ? "과매수" : v < -80 ? "과매도" : "중립"
    },
    {
      label: "CCI(14)",
      value: parseFloat(data.cci?.values?.[0]?.cci),
      status: data.cci?.status,
      판단: (v) => v > 100 ? "과매수" : v < -100 ? "과매도" : "중립"
    },
    {
      label: "ATR(14)",
      value: parseFloat(data.atr?.values?.[0]?.atr),
      status: data.atr?.status,
      판단: (_) => "변동성"
    },
    {
      label: "Highs/Lows(14)",
      value: parseFloat(data.highs_lows?.values?.[0]?.highs_lows),
      status: data.highs_lows?.status,
      판단: (_) => "추세 확인"
    },
    {
      label: "Ultimate Oscillator",
      value: parseFloat(data.ultimate_oscillator?.values?.[0]?.ultimate_oscillator),
      status: data.ultimate_oscillator?.status,
      판단: (v) => v < 30 ? "매수" : v > 70 ? "매도" : "중립"
    },
    {
      label: "ROC",
      value: parseFloat(data.roc?.values?.[0]?.roc),
      status: data.roc?.status,
      판단: (v) => v > 0 ? "매수" : "매도"
    },
    {
      label: "Bull/Bear Power(13)",
      value: parseFloat(data.bull_bear_power?.values?.[0]?.bull_bear_power),
      status: data.bull_bear_power?.status,
      판단: (v) => v > 0 ? "매수" : "매도"
    }
  ];

  // 📤 Webflow에 수치 및 판단 결과 삽입
  const resultBlocks = document.querySelectorAll('.list-i');

  indicators.forEach((indicator, idx) => {
    const item = resultBlocks[idx];
    if (!item) return;

    // 수치가 유효한 경우만 표시
    const isValid = indicator.status === "ok" && !isNaN(indicator.value);
    const valueText = isValid ? indicator.value.toFixed(2) : "-";
    const 판단 = isValid
      ? (indicator.signal !== undefined
          ? indicator.판단(indicator.value, indicator.signal)
          : indicator.판단(indicator.value))
      : "-";

    const textBlocks = item.querySelectorAll('.list-r .w-richtext, .list-r .TextBlock, .list-r div');

    if (textBlocks[0]) textBlocks[0].textContent = valueText;
    if (textBlocks[1]) textBlocks[1].textContent = 판단;
  });
}

button.addEventListener("click", loadChart);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadChart();
});