# 🌿 Green-ML 프로젝트 사용설명서

이 프로젝트는 AI 학습 및 추론 시 발생하는 탄소 배출량을 실시간으로 모니터링하고 시각화하는 솔루션입니다.

## 1. 프로젝트 주요 기능
- **실시간 탄소 대시보드**: CPU/GPU 사용량에 기반한 탄소 배출량 실시간 트래킹
- **탄소 영수증 (Carbon Receipt)**: 학습 세션 종료 시 감성적인 UI의 영수증 발행
- **AI 어드바이저**: 탄소 배출량을 줄이기 위한 학습 중단 및 최적화 가이드 제공

## 2. 기술 스택
- **Backend**: FastAPI (Python 3.12)
- **Frontend**: React Native (Expo)
- **Data Agent**: psutil 기반 실시간 전력 소모량 측정

## 3. 시작하기 (Quick Start)

### Backend 서버 실행
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 모바일 앱 실행
```bash
cd app
npm install
npx expo start
```

### 탄소 측정 에이전트 실행
```bash
cd measurement
python train_resnet_v3.py  # 또는 inference_realesrgan.py
```

## 4. 디렉토리 구조
- `app/`: React Native 모바일 앱 소스 코드
- `backend/`: FastAPI 기반 백엔드 API 서버
- `measurement/`: 탄소 배출량 측정 및 AI 모델 실행 스크립트
- `docs/`: 프로젝트 관련 문서 및 아카이브

## 5. 시연 영상 가이드
1. Backend 서버와 Expo 앱을 실행합니다.
2. `measurement/` 폴더의 스크립트를 실행하여 탄소 배출을 발생시킵니다.
3. 앱 화면에서 실시간으로 변하는 그래프와 탄소 영수증을 확인합니다.

---
**Green-ML Team** | *Sustainable AI for a greener future*
