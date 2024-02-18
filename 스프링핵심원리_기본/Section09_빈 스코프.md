# Section09\_빈 스코프

## 빈 스코프란?

- 스프링 빈은 기본적으로 싱글톤 스코프로 생성
  - 스코프는 번역 그대로 빈이 존재할 수 있는 범위
- 스프링은 다음과 같은 다양한 스코프 지원
- 싱글톤
  - 기본 스코프, 스프링 컨테이너의 시작과 종료까지 유지되는 가장 넓은 범위의 스코프
- 프로토타입
  - 스프링 컨테이너는 프로토타입 빈의 생성과 DI까지마 관여하고 이후에 관리하지 않는 매우 짧은 범위의 스코프
- 웹 관련 스코프
  - request
    - 웹 요청이 들어오고 나갈 때까지 유지되는 스코프
  - session
    - 웹 세션이 생성되고 종료될 때까지 유지되는 스코프
  - application
    - 웹의 서블릿 컨텍스트와 같은 범위로 유지되는 스코프
- 빈 스코프 지정 방법
  - 컴포넌트 스캔 자동 등록
    ```java
    @Scope("prototype")
    @Component
    public class HelloBean {}
    ```
  - 수동 등록
    ```java
    @Scope("prototype")
    @Bean
    PrototypeBean HelloBean() {
    return new HelloBean();
    }
    ```

## 프로토타입 스코프

- 싱글톤 스코프의 빈을 조회하면 스프링 컨테이너는 항상 같은 인스턴스의 스프링 빈을 반환
- 반면 프로토타입 스코프를 스프링 컨테이너에 조회하면 스프링 컨테이너는 항상 새로운 인스턴스를 생성해서 반환
- 싱글톤 빈 요청

  - 싱글톤 스크포의 빈을 스프링 컨테이너에 요청
  - 스프링 컨테이너는 본인이 관리하는 스프링 빈을 반환
  - 이후에 스프링 컨테이너에 같은 요청이 와도 같은 객체 인스턴스의 스프링 빈을 반환

- 프로토 타입 빈 요청

  - 프로토타입 스코프의 빈을 스프링 컨테이너에 요청
  - 스프링 컨테이너는 이 시점에 프로토타입 빈을 생성, 필요한 의존 관계를 주입

  - 스프링 컨테이너는 생성한 프로토타입의 빈을 클라이언트에 반환
  - 이후에 스프링 컨테이너에 같은 요청 시 항상 새로운 프로토타입 빈을 생성해서 반환

- 정리
  - 스프링 컨테이너는 프로토타입 빈을 생성 - 의존관계 주입 - 초기화까지만 처리
  - 이후에는 스프링 빈을 관리하지 않으므로 이를 관리하는 것은 클라이언트의 역할
    - 그래서 @PreDestory 같은 종료 메서드 호출 x
- 싱글톤 스코프 빈 테스트
  ```java
  package hello.core.scope;

  public class SingletonTest {

      @Test
      void singletonBeanFind() {
          AnnotationConfigApplicationContext ac = new AnnotationConfigApplicationContext(SingletonBean.class);

          SingletonBean singletonBean1 = ac.getBean(SingletonBean.class);
          SingletonBean singletonBean2 = ac.getBean(SingletonBean.class);
          System.out.println("singletonBean1 = " + singletonBean1);
          System.out.println("singletonBean2 = " + singletonBean2);
          assertThat(singletonBean1).isSameAs(singletonBean2);

          ac.close();
      }

      @Scope("singleton") // 원래는 default가 singleton이므로 안 적어도 된다
      static class SingletonBean {
          @PostConstruct
          public void init() {
              System.out.println("SingletonBean.init");
          }

          @PreDestroy
          public void destory() {
              System.out.println("SingletonBean.destory");
          }
      }
  }
  ```
- 호출 결과
  ```java
  SingletonBean.init
  singletonBean1 = hello.core.scope.SingletonTest$SingletonBean@205d38da
  singletonBean2 = hello.core.scope.SingletonTest$SingletonBean@205d38da
  SingletonBean.destory
  ```
  - 빈 초기화 메서드 실행
  - 같은 인스턴스의 빈을 조회
  - 종료 메서드까지 정상적으로 호출
- 프로토타입 스코프 빈 테스트
  ```java
  package hello.core.scope;

  public class PrototypeTest {

      @Test
      void prototypeBeanFind() {
          AnnotationConfigApplicationContext ac = new AnnotationConfigApplicationContext(PrototypeBean.class);
          System.out.println("find prototypeBean1");
          PrototypeBean prototypeBean1 = ac.getBean(PrototypeBean.class);
          System.out.println("find prototypeBean2");
          PrototypeBean prototypeBean2 = ac.getBean(PrototypeBean.class);
          System.out.println("prototypeBean1 = " + prototypeBean1);
          System.out.println("prototypeBean2 = " + prototypeBean2);
          assertThat(prototypeBean1).isNotSameAs(prototypeBean2);
      }

      @Scope("prototype")
      static class PrototypeBean {
          @PostConstruct
          public void init() {
              System.out.println("prototype.init");
          }

          @PreDestroy
          public void destory() {
              System.out.println("prototype.destory");
          }
      }
  }
  ```
- 실행 결과
  ```java
  find prototypeBean1
  prototype.init
  find prototypeBean2
  prototype.init
  prototypeBean1 = hello.core.scope.PrototypeTest$PrototypeBean@2663e964
  prototypeBean2 = hello.core.scope.PrototypeTest$PrototypeBean@48b67364
  ```
- 빈을 조회할 때 마다 초기화를 먼저 진행
- 이후에 종료 메서드를 실행하지 않음
- 프로토타입 빈의 특징 정리
  - 스프링 컨테이너에 요청할 때마다 새로 생성
  - 스프링 컨테이너는 프로토타입 빈의 생성과 의존관계 주입 그리고 초기화까지만 관여
  - 종료 메서드 호출 X
    - 그래서 클라이언트가 프로토타입 빈을 관리해야함
      - 종료 메서드에 대한 호출

## 프로토타입 스코프 - 싱글톤 빈과 함께 사용 시 문제점

- 스프링 컨테이너에 프로토타입 스코프의 빈을 요청하면 항상 새로운 객체 인스턴스를 생성해서 반환
  - 하지만 싱글톤 빈과 사용할 때는 의도한 대로 안 되는 경우가 있음
- 프로토타입 빈 직접 요청

  - 클라이언트A는 스프링 컨테이너에 프로토타입 빈을 요청
  - 스프링 컨테이너는 프로토타입 빈을 새로 생성해서 반환(x01)
    - 해당 빈의 count 필드 값은 0
  - 클라이언트는조회한 프로토타입 빈에 addCount()를 호출하면서 count 필드를 + 1 한다
  - 결과적으로 프로토타입 빈(x01)의 count는 1이 된다

  - 클라이언트 B는 스프링 컨테이너에 프로토타입 빈을 요청
  - 스프링 컨테이너는 프로토타입 빈을 새로 생성해서 반환(x02)
    - 해당 빈의 count 필드 값은 0
  - 클라이언트는 조회한 프로토타입 빈에 addCount()를 호출하면서 count 필드 +1
  - 결과적으로 프로토타입 빈(x02)의 count는 1이 된다
    ```java
    package hello.core.scope;

    public class SingletonWithPrototypeTest1 {

        @Test
        void prototypeFind() {
            AnnotationConfigApplicationContext ac = new AnnotationConfigApplicationContext(PrototypeBean.class);
            PrototypeBean prototypeBean1 = ac.getBean(PrototypeBean.class);
            prototypeBean1.addCount();
            assertThat(prototypeBean1.getCount()).isEqualTo(1);

            PrototypeBean prototypeBean2 = ac.getBean(PrototypeBean.class);
            prototypeBean2.addCount();
            assertThat(prototypeBean2.getCount()).isEqualTo(1);
        }

        @Scope("prototype")
        static class PrototypeBean {
            private int count = 0;

            public void addCount() {
                count++;
            }

            public int getCount() {
                return count;
            }

            @PostConstruct
            public void init() {
                System.out.println("PrototypeBean.init = " + this);
            }

            @PreDestroy
            public void destory() {
                System.out.println("PrototypeBean.destory");
            }

        }
    }
    ```

- 싱글톤 빈에서 프로토타입 빈 사용

  - clientBean이라는 싱글톤 빈이 의존관계 주입을 통해서 프로토타입 빈을 주입받는 예

  - clinetBean은 싱글톤이므로, 보통 스프링 컨테이너 생성 시점에 함께 생성되고, 의존관계 주입도 같이 발생

    - 의존관계 자동 주입이므로 주입 시점에 스프링 컨테이너에 프로토타입 빈을 요청
    - 스프링 컨테이너는 프로토타입 빈을 생성해서 clientBean에 반환
      - 프로토타입 빈의 count 필드 값은 0
    - clientBean은 프로토타입 빈을 내부 필드에 보관(참조값을 보관)

  - 클라이언트 A는 clientBean을 스프링 컨테이너에 요청해서 받는다 .
    - clientBean은 싱글톤이므로 항상 같은 객체
  - 클라이언트 A가 clientBean.logic() 호출
  - clientBean은 prototypeBean의 addCount()를 호출해서 프로토타입 빈의 count 증가

    - count 값이 1

  - 클라이언트 B는 clientBean을 스프링 컨테이너에 요청해서 받는다
    - 싱글톤이므로 항상 같은 clientBean이 반환
  - clinetBean 안의 프로토타입 빈은 이미 과거에 주입이 끝난 빈
    - **주입 시점에만 새로 생성이 된 것이고, 사용할 때마다 새로 생성되는 것은 아니다**
  - 클라이언트 B는 clientBean.logic()을 호출
  - clientBean은 prototypeBean의 addCount()를 호출해서 프로토타입 빈의 count 증가
    - 원래 count 값이 1이었으므로 2가 된다
      - 이는 원하는 바가 아님

  ```java
  package hello.core.scope;
  public class SingletonWithPrototypeTest1 {

      @Test
      void prototypeFind() {
          AnnotationConfigApplicationContext ac = new AnnotationConfigApplicationContext(PrototypeBean.class);
          PrototypeBean prototypeBean1 = ac.getBean(PrototypeBean.class);
          prototypeBean1.addCount();
          assertThat(prototypeBean1.getCount()).isEqualTo(1);

          PrototypeBean prototypeBean2 = ac.getBean(PrototypeBean.class);
          prototypeBean2.addCount();
          assertThat(prototypeBean2.getCount()).isEqualTo(1);
      }

      @Test
      void singletonClientUserPrototype() {
          AnnotationConfigApplicationContext ac = new AnnotationConfigApplicationContext(ClientBean.class, PrototypeBean.class);

          ClientBean clientBean1 = ac.getBean(ClientBean.class);
          int count1 = clientBean1.logic();
          Assertions.assertThat(count1).isEqualTo(1);
          ClientBean clientBean2 = ac.getBean(ClientBean.class);
          int count2 = clientBean1.logic();
          Assertions.assertThat(count2).isEqualTo(2);
      }

      @Scope("singleton")
      static class ClientBean {
          private final PrototypeBean prototypeBean;

          @Autowired
          public ClientBean(PrototypeBean prototypeBean) {
              this.prototypeBean = prototypeBean;
          }
          public int logic() {
              prototypeBean.addCount();
              int count = prototypeBean.getCount();
              return count;
          }
      }

      @Scope("prototype")
      static class PrototypeBean {
          private int count = 0;

          public void addCount() {
              count++;
          }

          public int getCount() {
              return count;
          }

          @PostConstruct
          public void init() {
              System.out.println("PrototypeBean.init = " + this);
          }

          @PreDestroy
          public void destory() {
              System.out.println("PrototypeBean.destory");
          }

      }
  }
  ```

- 여러 빈에서 같은 프로토타입 빈을 주입 받으면 주입 받는 시점에 각각 새로운 프로토타입 빈이 생성
  - 예를 들어서 clientA, clinetB가 각각 의존관계 주입을 받으면 각각 다른 인스턴스의 프로토타입 빈을 주입 받는다
  - clientA → prototypeBean@x01
  - clientB → prototypeBean@x02
  - 물론 호출할 때마다 새로 생성되는 것은 아니다 / 생성할 때만 새로 생성된다는 의미

## 프로토타입 스코프 - 싱글톤 빈과 함께 사용 시 Provider로 문제 해결

- 싱글톤 빈과 프로토타입 빈을 함께 사용할 때 항상 새로운 프로토타입 빈을 생성하는 방법
  - 의존관계를 외부에서 주입(DI) 받는게 아니라 이렇게 직접 필요한 의존관계를 찾는 것을 Dependency Lookup(DL) 의존관계 조회(탐색) 이라한다
  - 스프링 컨테이너에 요청
    - 메서드 안에 스프링 컨테이너를 통해서 매번 항상 새로 요청
      - 그런데 이렇게 스프링의 애플리케이션 컨텍스트 전체를 주입 받게 되면 스프링 컨테이너에 종속적인 코드가 되고 단위 테스트도 어려워진다
      - 지정한 프로토타입 빈을 컨테이너에서 대신 찾아주는 DL 기능만 필요
  - ObjectFactory, ObjectProvider
    - 지정한 빈을 컨테이너에서 대신 찾아주는 DL 서비스 제공 라이브러리
    - 과거에는 ObjectFactory였고 현재는 부가기능을 추가해 ObjectProvider가 됐다.
    ```java
    @Autowired
    private ObjectProvider<PrototypeBean> prototypeBeanProvider;

    public int logic() {
    		PrototypeBean prototypeBean = prototypeBeanProvider.getObject();
        prototypeBean.addCount();
    		int count = prototypeBean.getCount();
    		return count;
    }
    ```
    - 항상 새로운 프로토타입 빈을 생성
    - ObjectProvider의 getObject()를 호출하면 내부에서는 스프링 컨테이너를 통해 해당 빈을 찾아서 반환(DL)
    - 스프링이 제공하는 기능을 사용하지만 기능이 단순하므로 단위테스트 및 mock 코드 만들기 수월
    - 특징
      - ObjectFactory
        - 기능이 단순, 별도의 라이브러리 필요 없음, 스프링에 의존
      - ObjectProvider
        - ObjectFactory 상속, 옵션, 스트림 처리 등 편의 기능이 많음, 나머진 상동
  - JSR-330 Provider
    - `jakarta.inject.Provider` JSR-330 자바 표준 사용하는 방법
      ```java
      @Scope("singleton")
          static class ClientBean {

              @Autowired
              private Provider<PrototypeBean> prototypeBeanProvider;

              public int logic() {
                  PrototypeBean prototypeBean = prototypeBeanProvider.get();
                  prototypeBean.addCount();
                  int count = prototypeBean.getCount();
                  return count;
              }
          }
      ```
    - 기능은 ObjectFactory와 동일
    - 특징
      - get() 메서드 하나로 기능이 매우 단순해진다
      - 별도의 라이브러리가 필요하다
      - 자바 표준이므로 스프링이 아닌 다른 컨테이너에서도 사용 가능
  - 정리
    - 프로토타입 빈은 매번 사용할 때마다 의존관계 주입이 완료된 새로운 객체가 필요할 때 사용
      - 실무에서는 거의 사용할 일이 없음
    - ObjectProvider, JSR-330 Provider 등은 DL이 필요한 경우면 언제든지 사용 가능
    - 둘 중에 어떤 것을 사용할 지 (더 나아가 스프링과 자바 표준의 기능이 겹칠 경우)
      - 스프링이 더 다양하고 편리한 기능을 제공하기 때문에 대부분 스프링 기능 사용
      - 특별히 다른 컨테이너를 사용할 일이 있으면 자바 표준 사용

## 웹 스코프

- 특징
  - 웹 환경에서만 동작
  - 프로토타입과 다르게 스프링이 해당 스코프의 종료시점까지 관리
    - 종료 메서드가 호출
- 종류
  - request
    - HTTP 요청 하나가 들어오고 나갈 때 까지 유지되는 스코프, 각각의 HTTP 요청마다 별도의 빈 인스턴스가 생성 및 관리
  - session
    - HTTP sesstion과 동일한 생명주기를 가지는 스코프
  - application
    - 서블릿 컨텍스트(ServletContext)와 동일한 생명주기를 가지는 스코프
  - websocket
    - 웹 소켓과 동일한 생명주기를 가지는 스코프
- HTTP request 요청 당 각각 할당되는 request 스코프

## request 스코프 예제 만들기

- 웹 스코프는 웹 환경에서만 동작하므로 web 환경이 동작하도록 라이브러리 추가
  ```java
  //web 라이브러리 추가
  implementation 'org.springframework.boot:spring-boot-starter-web
  ```
  - `spring-boot-starter-web` 라이브러리를 추가하면 스프링 부트는 내장 톰캣 서버를 활용해서 웹 서버와 스프링을 함께 실행
- request 스코프 예제 개발

  - 동시에 여러 HTTP 요청이 들어오면 정확히 어떤 요청이 남긴 로그인지 구분 x
    - 이때 request 스코프 사용하면 좋다
  - 다음과 같은 로그가 남도록 request 스코프 활용해서 개발
    ```java
    [d06b992f...] request scope bean create
    [d06b992f...][http://localhost:8080/log-demo] controller test
    [d06b992f...][http://localhost:8080/log-demo] service id = testId
    [d06b992f...] request scope bean close
    ```
    - 기대하는 공통 포멧: UUID {message}
    - UUID를 사용해서 HTTP 요청을 구분하자
    - requestURL 정보도 추가로 넣어서 어떤 URL을 요청해서 남은 로그인지 확인하자
  - MyLogger
    ```java
    package hello.core.common;

    import jakarta.annotation.PostConstruct;
    import jakarta.annotation.PreDestroy;
    import org.springframework.context.annotation.Scope;
    import org.springframework.stereotype.Component;

    import java.util.UUID;

    @Component
    @Scope(value = "request")
    public class MyLogger {

        private String uuid;
        private String requestURL;

        public void setRequestURL(String requestURL) {
            this.requestURL = requestURL;
        }

        public void log(String message) {
            System.out.println("[" + uuid + "]" + "[" + requestURL + "]" + message);
        }

        @PostConstruct
        public void init() {
            uuid = UUID.randomUUID().toString();
            System.out.println("[" + uuid + "] request scope bean create:"  + this);
        }

        @PreDestroy
        public void close() {
            uuid = UUID.randomUUID().toString();
            System.out.println("[" + uuid + "] request scope bean close:"  + this);
        }

    }
    ```
    - 로그를 출력하기 위한 MyLogger 클래스
    - @Scope(value = “request”)를 사용해서 request 스코프로 지정
      - 이제 빈은 HTTP 요청 당 하나씩 생성, HTTP 요청이 끝나는 시점에 소멸
    - 이 빈이 생성되는 시점에 자동으로 @PostConstruct 초기화 메서드를 사용해서 uuid를 생성해서 저장
      - 이빈은 HTTP 요청 당 하나씩 생성하므로 uuid를 저장해두면 다른 HTTP 요청과 구분할 수 있다
    - 이 빈이 소멸되는 시점에 @PreDestory를 사용해서 종료 메시지를 남긴다
    - requestURL은 이 빈이 생성되는 시점에는 알 수 없으므로 외부에서 setter로 입력
  - LogDemoController

    ```java
    package hello.core.web;

    import hello.core.common.MyLogger;
    import jakarta.servlet.http.HttpServletRequest;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Controller;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.ResponseBody;

    @Controller
    @RequiredArgsConstructor
    public class LogDemoController {

        private final LogDemoService logDemoService;
        private final MyLogger myLogger;

        @RequestMapping("log-demo")
        @ResponseBody
        public String logDemo(HttpServletRequest request) {
            String requestURL = request.getRequestURI().toString();
            myLogger.setRequestURL(requestURL);

            myLogger.log("controller test");
            logDemoService.logic("testId");
            return "OK";
        }
    }
    ```

    - 로거가 잘 작동하는지 확인하는 테스트용 컨트롤러
    - 여기서 HttpServiceRequest를 통해서 요청 URL을 받음
      - requestURL 값 `http://localhost:8080/log-demo`
    - 이렇게 받은 requestURL 값을 myLogger에 저장
    - 컨트롤러에서 controller test라는 로그를 남긴다

    > 👻 **requestURL을 MyLogger에 저장하는 부분은 컨트롤러 < 스프링 인터셉트, 서블릿 필터**
    > → 공통 처리가 가능한 부분에 저장하는 것이 좋기 때문이다

  - LogDemoService 추가
    ```java
    package hello.core.web;

    import hello.core.common.MyLogger;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;

    @Service
    @RequiredArgsConstructor
    public class LogDemoService {

        private final MyLogger myLogger;
        public void logic(String id) {
            myLogger.log("service id = " + id);
        }
    }
    ```
    - 비즈니스 로직이 있는 서비스 계층에서도 로그를 출력해보자
    - 중점
      - request scope를 사용하지 않고 파라미터로 이 모든 정보를 서비스 계층에 넘기면 파라미터가 많아서 지저분해진다
      - requestURL 같은 웹과 관련된 정보가 웹과 관련 없는 서비스 계층까지 넘어간다
      - 웹과 관련된 부분은 컨트롤러까지만 사용
      - 서비스 계층은 웹 기술에 종속되지 않고 가급적 순수하게 유지하는 것이 유지보수 관점에서 좋다
      - request scope의 MyLogger 덕분에 이런 부분을 파라미터로 넘기지 않고 MyLogger의 멤버변수에 저장해서 코드와 계층을 깔끔하게 유지할 수 있다.
  - 실행 시 오류 발생
    ```java
    Error creating bean with name 'myLogger': Scope 'request' is not active for the
    current thread; consider defining a scoped proxy for this bean if you intend to
    refer to it from a singleton
    ```
    - 스프링 애플리케이션을 실행하는 시점에 싱글톤 빈은 생성해서 주입이 가능하지만 request 스코프 빈은 아직 생성되지 않는다
      - 실제로 고객의 요청이 와야 생성할 수 있기 때문

## 스코프와 Provider

- Provider를 사용하면 해결됨, 지금은 ObjectProvider를 사용
  ```java
  package hello.core.web;

  import hello.core.common.MyLogger;
  import jakarta.servlet.http.HttpServletRequest;
  import lombok.RequiredArgsConstructor;
  import org.springframework.beans.factory.ObjectProvider;
  import org.springframework.stereotype.Controller;
  import org.springframework.web.bind.annotation.RequestMapping;
  import org.springframework.web.bind.annotation.ResponseBody;

  @Controller
  @RequiredArgsConstructor
  public class LogDemoController {

      private final LogDemoService logDemoService;
      private final ObjectProvider<MyLogger> myLoggerProvider;

      @RequestMapping("log-demo")
      @ResponseBody
      public String logDemo(HttpServletRequest request) {
          String requestURL = request.getRequestURI().toString();
          MyLogger myLogger = myLoggerProvider.getObject();
          myLogger.setRequestURL(requestURL);

          myLogger.log("controller test");
          logDemoService.logic("testId");
          return "OK";
      }
  }
  ```
  - `ObjectProvider` 덕분에 `ObjectProvider.getObject()` 를 호출하는 시점까지 request.scpoe 빈의 생성을 지연
  - 호출하는 시점에는 HTTP 요청이 진행중이므로 request scope 빈의 생성이 정상 처리
  - `ObjectProvider.getObject()` 를 LogDemoController, LogDemoService에서 각각 한 번씩 따로 호출해도 같은 HTTP 요청이면 같은 **스프링 빈이 반환**

## 스코프와 프록시

- 프록시 방식
  ```java
  @Component
  @Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
  public class MyLogger {
  ```
- proxyMode = ScopedProxyMode.TARGET_CLASS 추가
  - 적용 대상이 클래스면 TARGET_CLASS
  - 적용 대상이 인터페이스면 INTERFACES
- 이렇게 하면 MyLogger의 가짜 프록시 클래스를 만들어두고, HTTP request와 상관 없이 가짜 프록시 클래스를 다른 빈에 미리 주입해 둘 수 있다.

### 웹 스코프와 프록시 동작 원리

- 주입된 myLogger 클래스 확인
  - `System.out.println("myLogger = " + myLogger.getClass());`
- 출력결과
  - `myLogger = class hello.core.common.MyLogger$$EnhancerBySpringCGLIB$$b68b726d`
- **CGLIB라는 라이브러리로 내 클래스를 상속 받은 가짜 프록시 객체를 만들어서 주입**

- 가짜 프록시 객체는 요청이 오면 그때 내부에서 진짜 빈을 요청하는 위임 로직이 있음
  - 클라이언트가 myLogger.log() 호출
  - 가짜 프록시 객체의 메서드 호출
  - 가짜 프록시 객체가 request 스코프의 진짜 myLogger.log()를 호출
  - 가짜 프록시 객체는 원본 클래스를 상속 받아서 만들어졌기 때문에 이 객체를 사용하는 클라이언트 입장에서는 사실 원본인지 아닌지도 모르게 동일하게 사용 가능(다형성)
- 특징
  - 프록시 객체 덕분에 클라이언트는 마치 싱글톤 빈을 사용하듯이 편리하게 request scope 사용 가능
  - **Provider나 프록시를 사용하는 핵심은 객체 조회를 필요한 시점까지 지연처리 하는 것**
  - 단지 애노테이션 설정 변경만으로 원본 객체를 프록시 객체로 대체 가능
    - 다형성과 DI 컨테니어의 장점
  - 웹 스코프가 아니더라도 프록시 사용 가능
- 주의점
  - 싱글톤을 사용하는 것 같지만 실제로는 다르게 동작하므로 주의해서 사용
  - 특별한 scope는 꼭 필요한 곳에만 최소화해서 사용, 무분별하게 사용하면 유지보수 어려움
