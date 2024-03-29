# Section01\_객체 지향 설계와 스프링

# 스프링

- 전통적인 J2EE(EJB)라는 겨울을 넘어서 새로운 시작이라는 뜻

### 스프링 진영에는 여러 가지가 있지만 제일 중요한 건 2가지

- 스프링 프레임워크
  - 핵심 기술
    - 스프링 DI 컨테이너, AOP, 이벤트
  - 웹 기술
    - 스프링 MVC, 스프링 WebFlux
  - 데이터 접근 기술
    - 트랜잭션, JDBC, ORM 지원, XML 지원
  - 기술 통합
    - 캐시, 이메일, 원격접근. 스케줄링
  - 테스트
    - 스프링 기반 테스트 지원
  - 언어
    - 코틀린, 그루비
- 스프링 부트
  - 스프링을 편리하게 사용할 수 있도록 지원 / 최근에는 기본으로 사용
  - 단독으로 실행할 수 있는 스프링 애플리케이션을 쉽게 생성
  - Tomcat 같은 웹 서버를 내장해서 별도의 웹 서버 설치 x
  - 손쉬운 빌드 구성을 위한 starter 종속성 제공
  - 스프링과 3rd parth(외부) 라이브러리 자동 구성
  - 메트릭, 상태 확인, 외부 구성 같은 프로덕션 준비 기능 제공
  - 관례에 의한 간결한 설정

### 스프링이란?

- 문맥에 따라 다르게 사용
  - 스프링 DI 컨테이너 기술
  - 스프링 프레임워크
  - 스프링 부트, 스프링 프레임워크 등을 모두 포함한 스프링 생테계

### 스프링은 왜 만들었는가?

- 이 기술은 왜 만들었는가? 이 기술의 핵심 컨셉은?
- 핵심
  - 자바 언어 기반의 프레임워크
  - 자바 언어의 가장 큰 특징 - 객체 지향 언어
  - 스프링은 좋은 객체 지향 애플리케이션을 개발할 수 있게 도와주는 프레임워크

### 스프링과 객체 지향

- 스프링은 다형성을 극대화해서 이용할 수 있게 해줌
- 제어의 역전(IoC), 의존관계 주입(DI)는 다형성을 활용해서 역할과 구현을 지원

### SOLID 원칙

- SRP: 단일 책임 원칙
  - 한 클래스는 하나의 책임만 가져야 한다.
  - 하나의 책임이라는 것은 모호하다
    - 클 수 있고, 작을 수 있다
    - 문맥과 상황에 따라 다르다
  - 중요한 기준은 변경
    - 변경이 있을 때 파급 효과가 적으면 단일 책임 원칙을 잘 따른 것
    - 예) UI 변경, 객체의 생성과 사용을 분리
- OCP: 개방 - 폐쇄 원칙
  - 소프트웨어 요소는 확장에는 열려 있으나 변경에는 닫혀 있어야 한다.
  - 다형성을 활용
  - 인터페이스를 구현한 새로운 클래스를 하나 만들어서 새로운 기능을 구현
  - 예시
    - MemberService 클라이언트가 구현 클래스를 직접 선택
      - MemberRepository m = new MemoryMemberRepository();
      - MemberRepository m = new JdbcMemberRepository();
    - 구현 객체를 변경하려면 클라이언트 코드를 변경해야 한다.
    - → 이는 OCP 원칙이 깨짐을 의미
    - 객체를 생성하고 연관관계를 맺어주는 별도의 조립이 필요
- LCP: 리스코프 치환 원칙
  - 프로그램의 객체는 프로그램의 정확성을 깨뜨리지 않으면서 하위 타입의 인스턴스로 바꿀 수 있어야 한다.
  - 다형성에서 하위 클래스는 인터페이스 규약을 다 지켜야 한다
  - 단순히 컴파일에 성공하는 것을 넘어서는 이야기
    - 예시
      - 자동차 인터페이스의 엑셀은 앞으로 가라는 기능
      - 뒤로 가게 하면 LSP 위반, 느리더라도 앞으로 가야함
- ISP: 인터페이스 분리 원칙
  - 특정 클라이언트를 위한 인터페이스 여러 개가 범용 인터페이스 하나보다 낫다
    - 자동차 인터페이스 → 운전 인터페이스, 정비 인터페이스로 분리
    - 사용자 인터페이스 → 운전자 클라이언트, 정비사 클라이언트로 분리
  - 분리하면 정비 인터페이스 자체가 변해도 운전자 클라이언트에 영향을 주지 않음
  - 인터페이스가 명확해지고, 대체 가능성이 높아진다.
- DIP: 의존관계 역전 원칙
  - 추상화에 의존해야지, 구체화에 의존하면 안된다
    - 의존성 주입은 이 원칙을 따르는 방법
  - 구현 클래스에 의존하지 말고, 인터페이스에 의존하라는 뜻
  - OCP에서 설명한 MemberService는 인터페이스에 의존하지만 구현 클래스에도 동시에 의존
    - DIP 위반
- 다형성 만으로는 OCP, DIP를 지킬 수 없다

## 객체 지향 설계와 스프링

- 스프링은 다음 기술로 다형성 + OCP, DIP를 가능하게 지원
  - DI: 의존관계, 의존성 주입
  - DI 컨테이너 제공
- 클라이언트의 코드의 변경 없이 기능 확장
- 하지만 인터페이스를 도입하면 추상화라는 비용이 발생
- 기능을 확장할 가능성이 없다면
  - 구체화된 클래스를 직접 사용하고 꼭 필요할 때 리펙터링해서 인터페이스를 도입하는 것도 방법
