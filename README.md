# 오토바이 정비 (motorcycle-maintenance)

아이폰 PWA 기반 오토바이 소모품·정비 관리 앱 프로젝트.

## 개발 현황
- v0.1 앱 전체 소스와 WebP 이미지 자료는 별도 ZIP 원본으로 준비됨.
- 이 저장소는 배포 및 대화창 간 인수인계를 위한 단일 공식 저장소임.
- 현재 앱 전체 파일 업로드와 GitHub Pages 활성화는 아직 완료되지 않음.

## v0.1 구성
- 정비소 배경 + 오토바이 8종 차량 선택
- 신차/중고차 및 초기 누적 주행거리 입력
- 소모품별 진행 게이지와 파랑/노랑/빨강 정비 버튼
- 정비 및 교체 내역 기록, JSON 백업/복원
- IndexedDB를 통한 각 사용자의 기기 내 데이터 저장
- PWA 오프라인 사용

## 운영 및 안전
- 앱 이름: 오토바이 정비
- 저장소: samuraiscene-alt/motorcycle-maintenance
- 외부 데이터베이스 없음; 휴대폰 내부 데이터 백업 권장
- 부품 교체 주기는 차종별 제조사 매뉴얼 기준으로 설정해야 하며 앱 초기 수치는 예시임
- 기존 정비 기록은 배포 또는 채팅 변경 시 삭제하지 않음

## 배포
v0.1 ZIP의 내부 motorcycle-maintenance 폴더에 있는 모든 파일을 **저장소 루트**에 올린 다음,
Settings → Pages → Deploy from a branch → main / (root) → Save.
