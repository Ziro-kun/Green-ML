import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Green-ML 정보</Text>
      <Text style={styles.text}>이 앱은 딥러닝 학습 시 발생하는 탄소 배출량을 측정하고 최적화 가이드를 제공합니다.</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text style={styles.linkText}>홈으로 돌아가기</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
});
