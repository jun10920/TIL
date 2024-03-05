# Section07_HTTP 헤더1 - 일반 헤더

## HTTP 헤더 개요

- HTTP 전송에 필요한 모든 부가정보
  - 메시지 바디의 내용, 메시지 바디의 크기, 압축, 인증, 요청 클라이언트, 서버 정보, 캐시 관리 정보 등

### RFC 7230 ~ 7235

- 과거의 엔티티 → 표현(Representation)으로 변경
- Representation = Representation Metadata + Representation Data
  - 표현 = 표현 메타데이터 + 표현 데이터
- 메시지 본문을 통해 표현 데이터 전달
  - 메시지 본문 = 페이로드(payload)
- 표현은 요청이나 응답에서 전달할 실제 데이터
- 표현 헤더는 표현 데이터를 해석할 수 있는 정보 제공
  - 데이터 유형(html, json), 데이터 길이, 압축 정보 등등
  - 표현 헤더는 표현 메타데이터와 페이로드 메시지를 구분해야 하지만 여기서는 생략

## 표현

- Content-Type: 표현 데이터의 형식
  - 미디어 타입, 문자 임코딩
    - texl/html; charset=utf-8
    - application/json
    - image/png
- Content-Encoding: 표현 데이터의 압축 방식
  - 표현 데이터를 압축하기 위해 사용
  - 데이터를 전달하는 곳에서 압축 후 인코딩 헤더 추가
  - 데이터를 읽는 쪽에서 인코딩 헤더의 정보로 압축 해제
    - gzip
    - deflate
    - identity
- Content-Language: 표현 데이터의 자연 언어
  - 표현 데이터의 자연 언어를 표현
    - ko
    - en
    - en-US
- Content-Length: 표현 데이터의 길이
  - 바이트 단위
  - Transfer-Encoding(전송 코딩)을 사용하면 Content-Length를 사용하면 안됨
- 표현 헤더는 전송, 응답 둘 다 사용

## 협상(콘텐츠 네고시에이션)

클라이언트가 선호하는 표현 요청

협상 헤더는 요청 시에만 사용

요청 시 우선순위를 적용해서 요청하면 이에 맞춰서 서버에서 응답

**종류**

- Accept: 클라이언트가 선호하는 미디어 타입 전달
- Accept-Charset: 클라이언트가 선호하는 문자 인코딩
- Accept-Encoding: 클라이언트가 선호하는 압축 인코디
- Accept-Language: 클라이언트가 선호하는 자연 언어

**우선순위**

- Quality Values(q) 값 사용
- 0 ~ 1, 클수록 높은 우선순위
  - 생략하면 1
- Accept-Language: ko-KR, ko; q=0.9, en-US;q-0.8,en;q=0.7

- 구체적일수록 높은 우선순위를 부여

## 전송 방식

- 단순 전송 / Content-Length
  - 단순한 전송, Content-Length로 길이 표현
- 압축 전송 / Content-Encoding
- 분할 전송 / Transfer-Encoding
  - 클라이언트의 요청 응답 메시지
  - chunked로 분할해서 응답
- 범위 전송 / Range, Content-Range
  - 범위를 지정해 해당하는 부분만 전송
    - 일부를 전송한 상태에서 다시 전송을 이어서 해야 하는 경우

## 일반 정보

- From
  - 유저 에이전트의 이메일 정보
  - 일반적으로 잘 사용하지 않음
  - 검색 엔진 같은 곳에서 주로 사용
  - 요청에서 사용
- Referer
  - 이전 웹 페이지 주소
  - 현재 요청된 페이지의 이전 웹 페이지 주소
    - A → B로 이동하는 경우 B를 요청할 때 Referer: A 를 포함해서 요청
    - Referer를 사용해서 유입 경로 분석 가능
    - 요청에서 사용
    - 오타에서 비롯됨
- User-Agent
  - 유저 에이전트 애플리케이션 정보
  - 클라이언트의 애플리케이션 정보(웹 브라우저 정보 등등)
  - 통계 정보
  - 어떤 종류의 브라우저에서 장애가 발생하는지 파악 가능
  - 요청에서 사용
- Server
  - 요청을 처리하는 오리진 서버의 소프트웨어 정보
    - Server: Apache/2.2.22(Debian)
    - Server: nginx
  - 응답에서 사용
- Date
  - 메시지가 생성된 날짜
    - Date: Tue, 15 Nov 1994 08:12:31 GMT
  - 응답에서 사용

## 특별한 정보

- Host
  - 요청한 호스트 정보(도메인)
  - 요청에서 사용
  - 필수
  - 하나의 서버가 여러 도메인을 처리해야 할 때
  - 하나의 IP 주소에 여러 도메인이 적용되어 있을 때
- Location
  - 페이지 리다이렉션
    - 201(Created)의 경우
      - Location 값은 요청에 의해 생성된 리소스 URI
    - 3xx(Redirection)의 경우
      - Location 값은 요청을 자동으로 리다이렉션하기 위한 대상 리소스를 가리킴
- Allow
  - 허용 가능한 HTTP 메서드
  - 405 (Method Not Allowed)에서 응답에 포함해야 함
  - Allow: GET-HEAD-PUT
- Retry-Afer
  - 유저 에이전트가 다음 요청을 하기까지 기다려야 하는 시간
  - 503(Service Unavailable): 서비스가 언제까지 불능인지 알려줄 수 있음
    - Retry-After: Fri, 31 Dec 1999 23:59:59 GMT (날짜 표기)
    - Retry-Afer: 120 (초단위 표기)

## 인증

- Authorization
  - 클라이언트 인증 정보를 서버에 전달
- WWW-Authenticate
  - 리소스 접근시 필요한 인증 방법 정의
  - 401 Unathorized 응답과 함께 사용

## 쿠키

- Set-Cookie
  - 서버에서 클라이언트로 쿠키 전달(응답)
- Cookie
  - 클라이언트가 서버에서 받은 쿠키를 저장하고, HTTP 요청시 서버로 전달
    - 로그인
    - 로그인 이후 welcome 페이지 접근
- 쿠키 예시
  - **set-cookie: sessionId=abcde 1234; expires=Sat, 26-Dec-2020 00:00:00 GMT; path=/; domain=google.com; Secure**
  - 사용처
    - 사용자 로그인 세션 관리
    - 광고 정보 트래킹
  - 쿠키 정보는 항상 서버에 전송됨
    - 네트워크 트래픽 추가 유발
    - 최소한의 정보만 사용 (세선id, 인증 토큰)
    - 서버에 전송하지 않고, 웹 브라우저 내부에 데이터를 저장하고 싶으면 웹 스토리지 사용
  - 주의해야 할 점
    - 보안에 민감한 데이터는 저장하면 안됨(주민번호, 신용카드 번호 등등)
  - 쿠키 생명주기
    - **set-cookie: expires=Sat, 26-Dec-2020 00:00:00 GMT;**
    - 만료일이 되면 쿠키 삭제
    - 세션 쿠키: 만료 날짜를 생략하면 브라우저 종료 시까지만 유지
    - 영속 쿠키: 만료 날짜를 입력하면 해당 날짜까지 유지
  - 쿠키 도메인
    - **domain=google.com;**
    - 명시: 명시한 문서 기준 도메인 + 서브 도메인 포함
    - 생략: 현재 문서 기준 도메인만 적용
      - 서브 도메인(하위 도메인은 쿠키 미접근)
  - 쿠키 경로
    - **path=/;**
    - 이 경로를 포함한 하위 경로 페이지만 쿠키 접근
  - 쿠키 보안
  - **Secure, HttpOnly, SameSite**
    - Secure
      - 쿠키는 http. https 구분하지 않고 전송
      - Secure를 적용하면 https 인 경우에만 전송
    - HttpOnly
      - XSS 공격 방지
      - 자바스크립트에서 접근 불가
      - HTTP 전송에만 사용
    - SameSite
      - XSRF 공격 방지
      - 요청 도메인과 쿠키에 설정된 도메인이 같은 경우만 쿠키 전송
