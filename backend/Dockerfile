# Python 3.10 경량화 이미지 사용
FROM python:3.10-slim

# 작업 디렉토리 설정
WORKDIR /app

# 필수 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    build-essential \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# 종속성 파일 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY . .

# 데이터베이스 파일 권한 설정 (SQLite용)
RUN touch green_ml.db && chmod 666 green_ml.db

# 포트 개방
EXPOSE 8000

# 서버 실행 명령 (모든 호스트 허용)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
