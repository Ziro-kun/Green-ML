import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from codecarbon import OfflineEmissionsTracker
import os

# MNIST용 간단한 신경망 모델
class SimpleNet(nn.Module):
    def __init__(self):
        super(SimpleNet, self).__init__()
        self.fc1 = nn.Linear(28 * 28, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = x.view(-1, 28 * 28)
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x

def train():
    # 탄소 배출 측정 시작 
    tracker = OfflineEmissionsTracker(
        country_iso_code="KOR",
        api_call_interval=1,
        save_to_file=False 
    )
    
    tracker.start()
    print("🚀 실시간 탄소 배출량 측정 시작...")

    # 데이터셋 및 로더 설정
    transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.1307,), (0.3081,))])
    train_dataset = datasets.MNIST('./data', train=True, download=True, transform=transform)
    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=64, shuffle=True)

    model = SimpleNet()
    optimizer = optim.SGD(model.parameters(), lr=0.01)
    criterion = nn.CrossEntropyLoss()

    model.train()
    print("🏋️ 모델 학습 중...")
    
    # 1 에포크만 짧게 학습 (데모용)
    for batch_idx, (data, target) in enumerate(train_loader):
        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()
        
        if batch_idx % 100 == 0:
            print(f"Batch {batch_idx}/{len(train_loader)} - Loss: {loss.item():.4f}")
        
        if batch_idx > 300: # 너무 오래 걸리지 않게
            break

    # 측정 종료 및 요약 출력
    emissions_data = tracker.stop()
    duration = tracker.final_emissions_data.duration
    energy = tracker.final_emissions_data.energy_consumed
    
    print(f"\n✅ 학습 완료!")
    print(f"🌲 예상 탄소 배출량: {emissions_data:.6f} kg CO2")
    
    # 백엔드 API로 데이터 전송
    import requests
    payload = {
        "project_name": "MNIST-Real-Training",
        "emissions": float(emissions_data),
        "energy_consumed": float(energy),
        "duration": float(duration)
    }
    
    try:
        # 도커 외부에서 실행되므로 localhost:8000 사용
        response = requests.post("http://localhost:8000/record", json=payload)
        if response.status_code == 200:
            print("🚀 데이터가 성공적으로 백엔드로 전송되었습니다!")
        else:
            print(f"❌ 데이터 전송 실패: {response.status_code}")
    except Exception as e:
        print(f"⚠️ 백엔드 연결 오류 (업로드 스킵): {e}")

if __name__ == "__main__":
    train()
