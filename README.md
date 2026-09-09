# DDIP 이시가키

이시가키 여행 일정 웹앱. GitHub 원본 저장소의 코드와 Git 이력을 가져와 이 폴더에서 이어서 개발합니다.

- 원본 저장소: https://github.com/tjdwons123-lgtm/ishigaki
- 운영 사이트: https://tjdwons123-lgtm.github.io/ishigaki/
- 가져온 기준 커밋: `1232ff7`

## 로컬 실행

Node.js가 설치된 환경에서 프로젝트 폴더에서 실행합니다.

```powershell
npx --yes http-server . -a 127.0.0.1 -p 8080 -c-1
```

브라우저에서 http://127.0.0.1:8080 을 엽니다. 종료는 `Ctrl+C`입니다. 별도 빌드 과정은 없습니다.

## 파일 구성

- `index.html`: 메인 화면, 스타일, 여행 데이터 및 앱 로직
- `review/index.html`: 일정 제안 검토 및 채택 화면
- `sw.js`: 오프라인 캐시 (현재 버전 `v19`)
- `manifest.webmanifest`, `icon*`: PWA 설치 설정 및 아이콘

## 개발 참고

파일은 UTF-8로 읽고 저장합니다. 배포 시 오프라인 캐시 갱신을 위해 `sw.js`의 `VERSION`도 올립니다. 로컬에서 이전 화면이 남아 있으면 브라우저 개발자 도구에서 서비스 워커와 캐시를 초기화합니다.

체크 상태와 사용자 설정 등은 브라우저의 `localStorage`에 저장됩니다. 운영 사이트의 저장 데이터는 로컬 주소로 자동 복사되지 않습니다. Claude 대화 기록과 GitHub에 반영되지 않은 작업은 이 저장소에 포함되지 않습니다.
