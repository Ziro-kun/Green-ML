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

def train_resnet():
    # 1. 탄소 배출 측정 시작 (실제 측정을 위해 Offline 모드 사용)
    tracker = OfflineEmissionsTracker(
        country_iso_code="KOR",
        api_call_interval=1,
        save_to_file=False
    )
    
    tracker.start()
    print("🚀 ResNet-18 실시간 탄소 배출량 측정 시작...")

    # 2. CIFAR-10 데이터셋 준비 (연산량이 MNIST보다 많음)
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
    ])

    print("📦 데이터셋 다운로드 및 로딩 중...")
    trainset = torchvision.datasets.CIFAR10(root='./data', train=True, download=True, transform=transform)
    trainloader = torch.utils.data.DataLoader(trainset, batch_size=128, shuffle=True, num_workers=2)

    # 3. 모델 설정 (ResNet-18)
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"🖥️ 사용 장치: {device}")
    
    model = resnet18(num_classes=10).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.SGD(model.parameters(), lr=0.001, momentum=0.9)

    # 4. 모델 학습 (배출량을 높이기 위해 어느 정도 반복)
    model.train()
    print("🏋️ ResNet-18 학습 중... (약 수 분 소요)")
    
    try:
        # 에포크를 제한하되, 배출량이 유의미하게 나오도록 조정
        for epoch in range(1):
            running_loss = 0.0
            for i, data in enumerate(trainloader, 0):
                inputs, labels = data[0].to(device), data[1].to(device)

                optimizer.zero_grad()
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()

                running_loss += loss.item()
                if i % 50 == 49:
                    print(f'[{epoch + 1}, {i + 1:5d}] loss: {running_loss / 50:.3f}')
                    running_loss = 0.0
                
                # 데모를 위해 적당히 끊어주기 (너무 오래 걸리지 않게)
                if i > 200: 
                    break
    except KeyboardInterrupt:
        print("🛑 학습 중단됨")

    # 5. 측정 종료 및 데이터 추출
    emissions_data = tracker.stop()
    duration = tracker._last_duration
    energy = tracker._total_energy
    
    print("\n" + "="*30)
    print(f"✅ 학습 완료 및 측정 결과")
    print(f"⏱️ 소요 시간: {duration:.2f}초")
    print(f"⚡ 에너지 소비: {energy:.6f} kWh")
    print(f"🌲 탄소 배출량: {emissions_data:.6f} kg CO2")
    print("="*30)

    # 6. 백엔드 API로 데이터 전송
    payload = {
        "project_name": "ResNet18-Advanced-Study",
        "emissions": float(emissions_data),
        "energy_consumed": float(energy),
        "duration": float(duration),
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        print(f"📡 데이터를 서버로 전송 중... ({API_URL})")
        response = requests.post(API_URL, json=payload, headers={'ngrok-skip-browser-warning': 'true'})
        if response.status_code == 200:
            print("🚀 영수증이 성공적으로 앱으로 전송되었습니다!")
        else:
            print(f"❌ 데이터 전송 실패: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"⚠️ 서버 연결 오류: {e}")

if __name__ == "__main__":
    train_resnet()
