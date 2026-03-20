import time
import requests
from codecarbon import EmissionsTracker

# 측정 시작
tracker = EmissionsTracker()
tracker.start()

# 더미연산
try:
  print("AI 모델 학습 시뮬레이션을 시작합니다.")
  for i in range(10):
    print(f"학습 진행중...{i+1}/10")
    time.sleep(1)
finally:
    emissions_data = tracker.stop()
    print(f"측정 완료! 배출량 {emissions_data}kg CO2eq 확인되었습니다.")

# 서버전송
url = "http://127.0.0.1:8000/record"
payload = {
  "project_name" : "Green-ML-Test-Project", "emissions":emissions_data,"energy_consumed":tracker.final_emissions_data.energy_consumed,"duration":tracker.final_emissions_data.duration
}

try:
  response = requests.post(url, json=payload)
  if response.status_code == 200:
    print("데이터가 서버에 성공적으로 전송되었습니다!")
    print(response.json())
  else:
    print(f"데이터 전송 실패 : {response.status_code}")
except Exception as e:
  print(f"서버 연결 오류: {e}")

