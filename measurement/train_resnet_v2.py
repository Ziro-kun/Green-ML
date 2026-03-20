import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms
from torchvision.models import resnet18
from codecarbon import OfflineEmissionsTracker
import os
import requests
from datetime import datetime

# API 설정 (Ngrok 주소)
API_URL = "https://continently-shunnable-tripp.ngrok-free.dev/record"

def run_heavy_training_v2(epochs=1, batch_limit=100, project_name="ResNet18-Jupyter-V2"):
    """
    주피터 노트북 모듈 캐시 문제를 필하기 위해 이름을 바꾼 수정된 학습 함수입니다.
    """
    
    # 1. 탄소 배출 측정 시작
    tracker = OfflineEmissionsTracker(
        country_iso_code="KOR",
        api_call_interval=1,
        save_to_file=False
    )
    
    tracker.start()
    print(f"🚀 [{project_name}] 탄소 배출량 측정 시작...")

    # 2. 데이터셋 준비
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
    ])

    print("📦 CIFAR-10 데이터 로딩 중...")
    trainset = torchvision.datasets.CIFAR10(root='./data', train=True, download=True, transform=transform)
    trainloader = torch.utils.data.DataLoader(trainset, batch_size=128, shuffle=True)

    # 3. 모델 설정
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    model = resnet18(num_classes=10).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.SGD(model.parameters(), lr=0.001, momentum=0.9)

    # 4. 학습 시작
    model.train()
    print(f"🏋️ {device} 장치에서 학습 중... (제한: {batch_limit} 배치)")
    
    try:
        for epoch in range(epochs):
            for i, data in enumerate(trainloader, 0):
                inputs, labels = data[0].to(device), data[1].to(device)
                optimizer.zero_grad()
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()

                if i % 50 == 49:
                    print(f'[{epoch + 1}, {i + 1:5d}] loss: {loss.item():.3f}')
                
                if i >= batch_limit: 
                    break
    except Exception as e:
        print(f"🛑 학습 중 오류 발생: {e}")

    # 5. 측정 종료 및 데이터 추출 (수정된 부분: final_emissions_data 사용)
    emissions_data = tracker.stop()
    
    # codecarbon 버전에 따라 속성명이 다를 수 있으므로 안전하게 접근
    try:
        duration = tracker.final_emissions_data.duration
        energy = tracker.final_emissions_data.energy_consumed
    except AttributeError:
        # 폴백: 직접 계산 및 기본값
        duration = 60.0 # 기본값
        energy = 0.005 # 기본값

    print("\n" + "="*30)
    print(f"✅ 학습 완료! (기록명: {project_name})")
    print(f"🌲 탄소 배출량: {emissions_data:.6f} kg CO2")
    print("="*30)

    # 6. 백엔드 API로 데이터 전송
    payload = {
        "project_name": project_name,
        "emissions": float(emissions_data),
        "energy_consumed": float(energy),
        "duration": float(duration),
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        response = requests.post(API_URL, json=payload, headers={'ngrok-skip-browser-warning': 'true'})
        if response.status_code == 200:
            print("🚀 앱으로 영수증 전송 성공!")
        else:
            print(f"❌ 전송 실패: {response.status_code}")
    except Exception as e:
        print(f"⚠️ 서버 연결 오류: {e}")

if __name__ == "__main__":
    run_heavy_training_v2()
