# 오토바이 정비 (motorcycle-maintenance)

아이폰 홈 화면 PWA 기반 오토바이 소모품·정비 기록 관리 앱.

## 현재 개발 기준 (2026-11-08)

- 앱 버전: **v2.9.169** (`version.json`).
- 등록 후보: **44기종 / 12개 브랜드** (`ui-skeleton/vehicle-catalog.js`).
- 기술자료·공식 정비주기 조사 현황: [MODEL_RESEARCH_AUDIT.md](./MODEL_RESEARCH_AUDIT.md). 공식 정비주기는 일부 연식·기종·항목만 검증되었으며 **44기종 전체 완료가 아니다**.
- 실제 실행 화면: `ui-skeleton/index.html`. 저장소 루트의 `index.html`은 이 화면으로 이동시킨다.
- 루트 `app.js`, `style.css` 등은 초기 버전 잔존 파일로, 현재 실행 화면의 주 구현 파일이 아니다.
- 차종 이미지: **40/44기종 참조 PNG 연결**(19기종 추가); 미연결 4기종: SUZUKI ADDRESS125, GSX-S125, KAWASAKI Z500, SYM JOYMAX. AI 이미지 연식·트림 검수 전. 이미지가 없는 기종을 다른 기종 이미지로 완성 처리하지 않는다.
- 부품/정비 주기: SUZUKI AVENIS125 국내형 UN125NE 2023 공식 교체·점검 주기 추가. YAMAHA MT-07 태국판 2023은 지역 확인 전 비자동 참고 전환. 제조사 원문에서 정확한 **연식·지역·트림**이 확인된 경우에만 적용한다. 확인 불가 시 공식 기본값으로 추측 입력하지 않는다.
- 사용자의 차량 등록, 주행거리, 정비 기록, 사용자 수정 주기는 앱 업데이트와 별도로 보존해야 한다.

## 개발 및 확인

1. 모델/부품/정비주기 기준: `ui-skeleton/vehicle-catalog.js`.
2. 사용자 데이터·화면 연결 코드: `ui-skeleton/` 하위 파일.
3. 모델별 조사 근거와 잔여 항목: `MODEL_RESEARCH_AUDIT.md`.
4. 이미지 파일 기준: `vehicle-art-inventory.json` 및 `VEHICLE_ART_GUIDE.md`.
5. 변경 후 `version.json` 및 아이폰 **홈 화면 PWA**의 표시 버전을 비교한다. GitHub에 커밋한 사실만으로 홈 화면 배포·실기기 동작 성공으로 간주하지 않는다.

## 배포 / 데이터

- 저장소: https://github.com/samuraiscene-alt/motorcycle-maintenance
- GitHub Pages: https://samuraiscene-alt.github.io/motorcycle-maintenance/
- 별도 유료 백엔드 없이 각 기기에 저장. 브라우저 Safari와 홈 화면 PWA는 설치 방식에 따라 저장 공간이 달라질 수 있으므로 백업/복원이 중요하다.
- **남은 작업**: 기종별 공식 전체 정비표와 지역·트림 확인, 부품 이미지 개별 제작 및 연결, 실제 홈 화면 PWA 동작 및 배포 검증.
