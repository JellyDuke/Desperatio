fetch('https://twelvedata-proxy.vercel.app/api/twelvedata?symbol=AAPL&indicator=rsi')
  .then(res => res.json())
  .then(data => {
    console.log("RSI:", data.value);  // 예: 63.45
    // 여기에 매수/매도 판단 넣을 수 있음
  });
