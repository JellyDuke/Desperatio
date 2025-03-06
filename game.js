<script>
//유저 정보 불러오기
document.addEventListener('DOMContentLoaded', () => {
  const gameStartBtn = document.querySelector('.load-btn');
  const importFileInput = document.getElementById('importFile');
  
  if (gameStartBtn && importFileInput) {
    // .game-start-btn 클릭 시 파일 선택창 열기
    gameStartBtn.addEventListener('click', () => {
      importFileInput.click();
    });
    
    // 파일 선택 후 JSON 확장자 체크
    importFileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        if (!file.name.toLowerCase().endsWith('.json')) {
          alert('JSON 파일만 올려주세요.');
          importFileInput.value = ""; // 파일 초기화
          return;
        }
        console.log('JSON 파일 업로드됨:', file.name);
        // 여기서 파일 읽기 및 데이터 처리 로직을 추가하세요.
      }
    });
  }
});
</script>
