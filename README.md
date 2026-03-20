# 🌲 Green-ML

Green-ML은 머신러닝(ML) 모델 학습 과정에서 발생하는 **탄소 배출량(Carbon Emissions)과 에너지 소비량(Energy Consumption)을 실시간으로 측정하고 시각화**하여, 더 친환경적이고 지속 가능한 AI 개발을 돕는 통합 플랫폼입니다.

## 🚀 주요 기능 (Features)

1. **실시간 탄소/전력 측정 (Measurement)**
   - `CodeCarbon` 라이브러리를 활용하여 PyTorch, TensorFlow 등의 모델 학습 시 발생하는 실제 CPU/GPU 전력 소비량과 탄소 배출량을 데이터화합니다.
   
2. **모바일 탄소 영수증 (Mobile App)**
   - React Native (Expo) 기반의 모바일 앱을 통해 언제 어디서든 최근 학습 세션의 '탄소 영수증'을 발급받아 직관적으로 수치를 확인할 수 있습니다.

3. **학습 이력 관리 (History)**
   - 누적된 탄소 배출량과 에너지 소비량을 트래킹하고, 과거 세션들의 기록을 모바일 앱 및 웹 대시보드에서 조회할 수 있습니다.

4. **AI 최적화 어드바이저 (AI Advisor)**
   - 학습 효율을 높이고 에너지를 절약할 수 있는 다양한 인프라 및 코드 최적화 팁(예: Region 변경, Early Stopping 도입 등)을 제공합니다.

---

## 🏗️ 시스템 아키텍처 (Architecture)

본 프로젝트는 4개의 주요 모듈로 구성되어 있습니다.

- **`backend/`**: FastAPI와 SQLite 기반의 서버. 측정된 데이터를 수집하고 앱/웹에 제공합니다. (Docker 지원)
- **`app/`**: React Native (Expo Router) 기반의 iOS/Android 모바일 애플리케이션.
- **`measurement/`**: Python 스크립트. `CodeCarbon`을 이용한 벤치마크 및 실제 모델 학습 측정 코드가 포함되어 있습니다.
- **`web/`**: React 기반의 브라우저용 대시보드 (선택적 사용).

---

## 🛠️ 기술 스택 (Tech Stack)

- **Backend**: Python 3.10, FastAPI, SQLAlchemy, SQLite, Uvicorn, Docker, docker-compose
- **Frontend (Mobile)**: React Native, Expo, Expo Router, TypeScript
- **Measurement**: CodeCarbon, PyTorch
- **Infra**: Ngrok (External URL forwarding)

---

## 🏃‍♂️ 시작하기 (Getting Started)

### 1. 백엔드 서버 실행 (Docker)
가장 빠르고 안정적인 실행을 위해 Docker 포워딩을 권장합니다.
```bash
# 루트 디렉토리에서 실행
docker-compose up --build -d
```
> 서버는 `http://localhost:8000` 에서 백그라운드로 실행됩니다.

### 2. 모바일 앱 실행
```bash
cd app
npm install
npx expo start
```
> Expo Go 앱을 통해 QR 코드를 스캔하여 모바일 기기에서 확인하세요.
> (외부 접속이 필요한 경우 `ngrok`을 통해 백엔드 주소를 포워딩한 후 `index.tsx`의 API 엔드포인트를 변경해야 합니다.)

### 3. 탄소 측정 스크립트 실행 (예제)
실제 또는 더미 학습 데이터를 발생시켜 백엔드로 전송합니다.
```bash
# 파이썬 환경 세팅 필요 (requirements.txt 설치)
python measurement/train_mnist.py
# 또는 python measurement/dummy_tracker.py
```

---

## 💡 활용 방안

- **개인 연구자**: 자신의 ML 실험이 환경에 미치는 영향을 자각하고 최적화.
- **기업/랩실**: 전체 팀의 GPU 클러스터 탄소 발자국을 모니터링 및 리포팅.

*Developed for the Green-ML Initiative.*
