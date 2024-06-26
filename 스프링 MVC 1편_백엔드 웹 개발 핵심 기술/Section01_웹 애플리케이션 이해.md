# Section01\_웹 애플리케이션 이해

## 웹 서버, 웹 애플리케이션 서버

### Web Server

- HTTP 기반으로 동작
- 정적 리소스 제공
  - NGINX, APACHE

### WAS(Web Application Server)

- HTTP 기반으로 동작
- 웹 서버 기능 포함
- 프로그램 코드를 실행해서 애플리케이션 로직 수행
  - 동적 HTML, HTTP API(JSON)
  - 서블릿, JSP, 스프링 MVC
- 톰캣, Jetty, Undertow

둘의 차이가 모호하나 WAS 가 애플리케이션 코드를 실행하는데 더 **특화**

### 웹 시스템 구성

- WAS, DB만으로 구성이 가능
  - 하지만
    - 서버(WAS)에 과부하 우려
    - 애플리케이션 로직이 정적 리소스 때문에 방해 받음
    - WAS 장애시 오류 화면도 노출 불가능
- 그래서 WEB, WAS, DB로 구성
  - 정적 리소스는 웹 서버가 처리
  - WAS는 애플리케이션 로직 처리
    - 각각의 리소스가 과부하 되면 각자의 서버를 증설
  - 정적 리소스만 제공하는 웹 서버는 장애가 잘 일어나지 않음
    - WAS가 장애가 발생하면 웹 서버에서 오류 화면 제공

## 서블릿

클라이언트에서 서버로 HTML Form 데이터를 POST 전송 (유저 데이터 저장)

→ 웹 애플리케이션 서버가 처리해야 하는 업무

- 초록색에 해당하는 의미있는 비즈니스 로직을 하기 위해 해야 하는 반복 작업들이 많음
  - 그래서 서블릿을 지원하는 WAS에서는 비즈니스 로직을 제외한 모든 부분을 해줌
  - urlPattern이 호출되면 서블릿 코드 실행
    - HTTP 요청 정보와 응답 정보와 응답 정보를 편리하게 다룰 수 있게 매개 변수 형태로 Request, Response 객체를 만들어서 서블릿 객체 호출
    - 개발자는 HTTP 스펙을 매우 편리하게 사용
- 서블릿 컨테이너
  - 톰캣처럼 서블릿을 지원하는 WAS
  - 서블릿 객체를 생성, 초기화, 호출, 종료하는 생명주기 관리
- 서블릿 객체
  - HttpServlet을 의미
  - 싱글톤으로 관리
    - 고객의 요청이 올 때마다 계속 객체를 생성하는 것은 비효율
    - 최초 로딩 시점에 서블릿 객체를 만들어두고 재활용
    - 공유 변수 사용 주의
- JSP도 서블릿으로 변환 되어서 사용
- 동시 요청을 위한 멀티 쓰레드 처리 지원

## 동시 요청 - 멀티 쓰레드

### 쓰레드

- 애플리케이션 코드를 하나하나 순차적으로 실행하는 것은 쓰레드
  - 쓰레드는 한 번에 하나의 코드 라인만 수행
  - 동시 처리가 필요하면 쓰레드를 추가로 생성

  - 장점
    - 동시 요청 처리 가능
    - 리소스(CPU, 메모리)가 허용할 때까지 처리 가능
    - 하나의 쓰레드가 지연 되어도 나머지 쓰레드는 정상 동작
  - 단점
    - 쓰레드 생성 비용이 매우 비싸다
    - 컨텍스트 스위칭 비용이 과도하게 발생한다
      - 운영체제가 한 작업에서 다른 작업으로 CPU의 제어를 전환할 때 발생하는 비용
    - 쓰레드 생성에 제한이 없다
      - 고객 요청이 너무 많이 오면, CPU와 메모리의 임계점을 넘어서 서버가 다운

### 쓰레드 풀

- 특징
  - 필요한 쓰레드를 쓰레드 풀에 보관하고 관리
  - 쓰레드 풀에 생성 가능한 쓰레드의 최대치를 관리 / 톰캣은 최대 200개 기본 설정
- 사용
  - 쓰레드가 필요하면 이미 생성되어 있는 쓰레드를 쓰레드 풀에서 꺼내서 사용
  - 사용을 종료하면 쓰레드 풀에 해당 쓰레드를 반납
  - 최대 쓰레드가 모두 사용중이어서 쓰레드 풀에 쓰레드가 없으면?
    - 기다리는 요청을 거절/대기 하도록 설정 가능
- 장점
  - 쓰레드가 미리 생성되어 있어서 쓰레드를 생성/종료하는 비용이 절약되고 응답 시간이 빠르다
  - 생성 가능한 쓰레드의 최대치가 있으므로 너무 많은 요청이 들어와서 서버가 다운되지 않는다
- **실무 팁**
  - WAS의 주요 튜닝 포인트는 최대 쓰레드(max thread) 수이다
  - 이 값을 낮게 설정하면
    - 동시 요청이 많으면 서버 리소스는 여유롭지만 클라이언트는 금방 응답 지연
  - 이 값을 높게 설정하면
    - 동시 요청이 많으면 CPU, 메모리 리소스 임계점 초과로 서버 다운
  - 장애 발생시?
    - 클라우드면 서버부터 늘리고 이후에 튜닝
    - 클라우드가 아니라면 열심히 튜닝
  - 적정 숫자
    - 애플리케이션 로직의 복잡도, CPU, 메모리 IO 리소스 상황에 따라 모두 다름
    - 성능 테스트
      - 최대한 실제 서비스와 비슷하게 성능 테스트 시도
      - 툴: 아파치 ab. 제이미터, **nGrinder**

### WAS의 멀티 쓰레드 지원

- 개발자가 싱글 스레드 프로그래밍을 하듯이 편리하게 소스 코드를 개발
  - 멀티 스레드 관련해서는 WAS가 처리
  - 멀티 스레드 환경이므로 싱글톤 객체(서블릿, 스프링 빈)은 주의해서 사용

## HTML, HTTP API, CSR, SSR

### 정적 리소스

- 고정된 HTML, CSS, JS, 이미지, 영상 등

### HTML 페이지

- 동적으로 필요한 HTML 파일을 생성해서 전달
  - WAS 통해서 동적으로 HTML 생성: JSP, 타임리프

### HTTP API

- HTML이 아니라 데이터를 JSON 형태로 전달
- UI화면이 필요한 경우 클라이언트에서 별도 처리
- 클라이언트 <> 서버 뿐만 아니라 서버 <> 서버인 경우에도 많이 사용

### 서버사이드 렌더링 / SSR

- HTML 최종 결과를 서버에서 만들어서 웹 브라우저에 전달
- 주로 정적인 화면에 사용
- 관련기술: 타임리프, JSP

### 클라이언트 사이드 렌더잉 / CSR

- HTML 결과를 자바스크립트를 통해 웹 브라우저에서 동적으로 생성해서 적용
- 주로 동적인 화면에 적용
- 웹 환경을 앱처럼 필요한 곳을 맘대로 변경 가능
  - 구글 지도, Gmail, 구글 캘린더
  - 관련 기술: React, Vue.js → 웹 프론트엔드 개발자
- 참고
  - CSR과 SSR의 경계가 뚜렷한 것은 아니다

## 자바 백엔드 웹 기술 역사

- 최신 기술 - 스프링 웹 기술의 분화
  - Web Servlet - Spring MVC
  - Web Reactive - Spring WebFlux
- 자바 뷰 템플릿 역사
  - HTML을 편리하게 생성하는 뷰 기능
  - JSP
    - 속도 느림, 기능 부족
  - 프리마커, 벨로시티
    - 속도 문제 해결, 다양한 기능
  - 타임리프(Thymeleaf)
    - 네추럴 템플릿: HTML의 모양을 유지하면서 뷰 템플릿 적용 가능
    - 스프링 MVC와 강력한 기능 통합
      - 최선의 선택, 단 성능은 프리마커, 벨로시티가 더 빠름
