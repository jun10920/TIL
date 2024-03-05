# Section02_URI와 웹 브라우저 요청 흐름

## URI(Uniform Resource Identifier)

### URI

- Uniform: 리소스 식별하는 통일된 방식
- Resource: 자원, URI로 식별할 수 있는 모든 것(제한 없음)
- Identifier: 다른 항목과 구분하는데 필요한 정보

### URL, URN

- URL - Locator: 리소스가 있는 위치를 지정
- URN - Name: 리소스에 이름을 부여
  - 위치는 변할 수 있지만 이름은 변하지 않는다
  - URN 이름만으로 실제 리소스를 찾을 수 있는 방법이 보편화 되지 않음
  - 그래서 **URL을 대체로 사용**

### URL 문법

- **scheme://[userinfo@]host[:port][/path][?query][#fragment]**
- **https://www.google.com:443/search?q=hello&hI=ko**
  - 프로토콜 - https
  - 호스트명 - www.google.com
  - 포트 번호 - 443
  - 패스 - /search
  - 쿼리 파라미터 - (q=hello&hI=ko)
- scheme
  - 주로 프로토콜 사용
    - 프로토콜은 어떤 방식으로 자원에 접근할 것인가 하는 약속 규칙
      - http, https, ftp
    - http는 80 포트, https는 443 포트 사용, 포트는 생략 가능
      - https는 http에 보안 추가 (HTTP Secure)
- userinfo
  - URL에 사용자정보를 포함해서 인증
  - 거의 사용하지 않음
- host
  - 호스트명
  - 도메인명 또는 IP 주소를 직접 사용가능
- port
  - 접속 포트
  - 일반적으로 생략, 생략시 http = 80, https = 443
- path
  - 리소스 경로(path), 계층적 구조
  - 예시
    - /home/file1.jpg
    - /members
    - /members/100, /items/iphone12
- query
  - key = value 형태
  - ?로 시작, &로 추가 가능
  - query parameter, query string으로 불림
- fragment
  - html 내부 북마크 등에 사용
  - 서버에 전송하는 정보 아님

## 웹 브라우저 요청 흐름

- 출발지 IP 주소에서 목적지 IP 주소로 전송
- 목적지 IP주소에서 HTTP 응답 메시지 생성
- 다시 도착지 IP주소에서 출발지로 전송 후 렌더링
