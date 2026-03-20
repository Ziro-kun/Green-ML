# 🌿 Green-ML: 지속 가능한 AI 대시보드

> [사용설명서 바로가기 (MANUAL.md)](./MANUAL.md)

Green-ML은 간단한 전제에서 시작합니다: **AI 개발이 지구를 희생시켜서는 안 된다**는 것입니다. 이 프로젝트는 탄소 배출량 감축에 초점을 맞춘 딥러닝 학습 세션용 실시간 모니터링 및 최적화 플랫폼을 제공합니다.

## 🚀 주요 기능

- **실시간 탄소 영수증**: 각 학습 세션 후 즉시 탄소 배출 보고서(영수증 스타일) 생성.
- **AI 어드바이저**: 학습 패턴에 기반한 지능형 최적화 팁 제공 (예: "조기 종료", "혼합 정밀도 학습", "지역 이동").
- **세션 이력**: 과거 모든 학습 세션의 이력을 추적하고 분석.
- **하드웨어 통합**: Apple Silicon (M 시리즈) 성능 카운터를 통해 정확한 전력 소비 데이터를 가져오도록 최적화.

## 🛠️ 기술 스택

- **백엔드**: FastAPI, SQLAlchemy, CodeCarbon
- **프론트엔드**: React Native (Expo SDK), Ionicons
- **인프라**: Docker, Ngrok (로컬 터널링용)
- **ML 프레임워크**: PyTorch, Torchvision

## 📦 시작하기

### 백엔드 설정
1. `cd backend`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --reload --host 0.0.0.0`

### 모바일 앱 설정
1. `cd app`
2. `npm install`
3. `npx expo start`

### 측정 설정
탄소 배출 측정 스크립트는 `measurement/` 디렉토리에 있습니다. 고부하 시연을 위해 `train_resnet_v3.py`를 사용하세요.

## 🌟 Acknowledgement
이 프로젝트는 개발자들이 자신의 코드가 환경에 미치는 영향을 이해하고, 더 나은 "친환경적인" 아키텍처 결정을 내릴 수 있도록 돕기 위해 개발되었습니다.
