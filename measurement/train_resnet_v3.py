import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms
from torchvision.models import resnet101
from codecarbon import OfflineEmissionsTracker
import os
import requests
from datetime import datetime

# API 설정
API_URL = "http://127.0.0.1:8000/record"
NGROK_URL = "https://continently-shunnable-tripp.ngrok-free.dev/record"

def run_heavy_training(epochs=1, batch_limit=50, project_name="ResNet101-Heavy-Check"):
    """
    ResNet-101 모델을 사용하여 짧은 시간 내에 높은 탄소 배달량을 유도하는 '헤비급' 스크립트입니다.
    배치 제한이 50이어도 모델 덩치가 커서 확실한 잔소리를 들을 수 있습니다.
    """
    
    # 1. 탄소 배출 측정 시작
    tracker = OfflineEmissionsTracker(
        country_iso_code="KOR",
        api_call_interval=1,
        save_to_file=False,
        log_level="error"
    )
    
    tracker.start()
    print(f"🚀 [{project_name}] '헤비급' 탄소 측정 시작 (ResNet-101)...")

    # 2. 데이터셋 준비 (CIFAR-10)
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
    ])

    trainset = torchvision.datasets.CIFAR10(root='./data', train=True, download=True, transform=transform)
    trainloader = torch.utils.data.DataLoader(trainset, batch_size=64, shuffle=True)

    # 3. 모델 설정 (더 깊은 ResNet-101 사용)
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"🏋️ {device} 장치에서 ResNet-101 모델 준비 중...")
    model = resnet101(num_classes=10).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.SGD(model.parameters(), lr=0.001, momentum=0.9)

    # 4. 학습 시작
    model.train()
    print(f"🔥 학습 시작 (제한: {batch_limit} 배치)... 모델이 무겁습니다!")
    
    try:
        for epoch in range(epochs):
            for i, data in enumerate(trainloader, 0):
                inputs, labels = data[0].to(device), data[1].to(device)
                optimizer.zero_grad()
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()

                if i % 10 == 9:
                    print(f'[Step {i + 1:3d}] 모델이 무거워 배출량이 빠르게 쌓이는 중...')
                
                if i >= batch_limit: 
                    break
    except Exception as e:
        print(f"🛑 학습 중 오류 발생: {e}")

    # 5. 측정 종료 및 데이터 추출
    emissions_data = tracker.stop()
    
    try:
        duration = tracker.final_emissions_data.duration
        energy = tracker.final_emissions_data.energy_consumed
    except AttributeError:
        duration = 120.0
        energy = 0.015

    print("\n" + "="*40)
    print(f"✅ Training session completed. (ID: {project_name})")
    print(f"🌲 Total carbon emissions: {emissions_data:.6f} kg CO2")
    print("="*40)

    payload = {
        "project_name": project_name,
        "emissions": float(emissions_data),
        "energy_consumed": float(energy),
        "duration": float(duration),
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        response = requests.post(API_URL, json=payload, headers={'ngrok-skip-browser-warning': 'true'}, timeout=5)
        if response.status_code == 200:
            print("Successfully recorded session to Local API.")
        else:
            print(f"Local API Error ({response.status_code}), retrying with ngrok...")
            requests.post(NGROK_URL, json=payload, headers={'ngrok-skip-browser-warning': 'true'}, timeout=10)
    except Exception as e:
        print(f"Connection error to local API, retrying with ngrok...")
        try:
            requests.post(NGROK_URL, json=payload, headers={'ngrok-skip-browser-warning': 'true'}, timeout=10)
            print("Successfully recorded session to Ngrok API.")
        except Exception:
            print("Failed to record session to both Local and Ngrok API.")

if __name__ == "__main__":
    run_heavy_training()
