# 🌿 Green-ML Prototype Implementation Plan

## 1. 개요
5시 마감에 맞춘 AI 탄소 발자국 측정 프로토타입.
리얼타임 모니터링 → 탄소 환산 → 디자인 위주의 영수증 발행에 집중.

## 2. 시스템 아키텍처
```mermaid
graph LR
    Agent[Agent (psutil/Python)] -- Metrics --> BE[Backend (FastAPI)]
    BE -- REST API --> Mobile[Mobile App (Expo)]
    Mobile -- Remote Control --> BE
```

## 3. 기술 상세 스택
- **Backend**: FastAPI (Python 3.12)
- **Frontend**: React Native (Expo SDK), React Navigation
- **UI/UX**: Custom CSS (Premium Dark Theme), Lottie/Charts (Reanimated 3)
- **Data Source**: Simulated metrics + Local CPU Load (psutil)

## 4. 모듈별 설계 (Milestones)

### Phase 1: Backend & Data Agent (마감: 12:00)
- **Agent script**:
  - `psutil`을 사용하여 CPU 사용률을 실시간으로 가져옴.
  - 임의의 전력 환산 계수(예: 1% CPU = 0.5W)를 사용하여 `power_usage` 계산.
  - 매 1초마다 Backend로 전송 (또는 Backend가 가져옴).
- **Backend API**:
  - `GET /api/v1/metrics`: 현재 전력 소모량, 누적 탄소 배출량 리포트.
  - `GET /api/v1/receipts`: 더미 데이터를 포함한 탄소 영수증 목록.
  - `POST /api/v1/control/stop`: 학습 중단 명령 시뮬레이션 (상태값 변경).

### Phase 2: Mobile Premium UI (마감: 15:00)
- **Main Home Dashboard**:
  - 유리 질감(Glassmorphism) 카드 UI.
  - 실시간 전력 소모 동적 차트.
  - 나무 이모지와 연동된 "지구 구호 정도" 메트릭.
- **Carbon Receipt Page**:
  - 실제 영수증처럼 위아래가 지그재그로 잘린 형태의 UI.
  - QR 코드 (이미지) 및 상세 학습 내역 (Epoch, Duration, GPU 모델명 등).

### Phase 3: Integration & Polish (마감: 16:30)
- **Integration**: `fetch` API 또는 `axios`를 통한 실시간 데이터 갱신 (Polling 방식).
- **UX Polish**: 화면 전환 애니메이션, 햅틱 피드백 적용.

## 5. 성공 지표 (Success Metrics)
1. 시연 중 CPU 사용량이 변함에 따라 앱의 그래프가 즉시 반응하는가?
2. 출력되는 '탄소 영수증' UI가 사용자에게 "와우"를 주는가?
3. 5시 정각에 시연이 가능한 상태인가?
