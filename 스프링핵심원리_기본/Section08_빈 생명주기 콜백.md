# Section08\_빈 생명주기 콜백

## 빈 생명주기 콜백 시작

- 데이터베이스 커넥션 풀, 네트워크 소켓과 같은 작업은
  - 시작 시점에 필요한 연결을 미리 하고
  - 종료 시점에 연결을 모두 종료하는 작업을 진행해야 함
  - 이를 위해서는 객체의 초기화와 종료 작업이 필요
- 간단하게 외부 네트워크에 미리 연결하는 객체를 하나 생성한다고 가정
  - 실제로 네트워크에 연결하는 것은 아니고 단순히 문자만 출력
- NetoworkClient 클래스
  ```java
  package hello.core.lifecycle;

  public class NetworkClient {

      private String url;

      public NetworkClient( ) {
          System.out.println("생성자 호출, url = " + url);
          connect();
          call("초기화 연결 메시지");
      }

      public void setUrl(String url) {
          this.url = url;
      }

      public void connect() {
          System.out.println("connect: " + url);
      }

      public void call(String message) {
          System.out.println("call " + url + " message = " + message);
      }

      public void disconnect() {
          System.out.println("close: " + url);
      }
  }
  ```
- 스프링 환경설정과 실행
  ```java
  package hello.core.lifecycle;

  import org.junit.jupiter.api.Test;
  import org.springframework.context.ApplicationContext;
  import org.springframework.context.ConfigurableApplicationContext;
  import org.springframework.context.annotation.AnnotationConfigApplicationContext;
  import org.springframework.context.annotation.Bean;
  import org.springframework.context.annotation.Configuration;

  public class BeanLifeCycleTest {

      @Test
      public void lifeCycleTest() {
          ConfigurableApplicationContext ac = new AnnotationConfigApplicationContext(LifeCycleConfig.class);
          NetworkClient client = ac.getBean(NetworkClient.class);
          ac.close();
      }

      @Configuration
      static class LifeCycleConfig {

          @Bean
          public NetworkClient networkClient() {
              NetworkClient networkClient = new NetworkClient();
              networkClient.setUrl("http://hello-spring.dev");
              return networkClient;
          }
      }
  }
  ```
- 호출 결과
  ```java
  생성자 호출, url = null
  connect: null
  call null message = 초기화 연결 메시지
  ```
- 생성자 부분에 url 정보 없이 호출됨
  - 수정자 주입을 통해서 setUrl이 호출되어야 url이 존재하기 때문이다
- 스프링 빈은 다음과 같은 라이프사이클을 가진다
  - 객체 생성 → 의존관계 주입
- 스프링은 DI 이후에 스프링 빈에게 콜백 메서드를 통해 초기화 시점을 알려주는 다양한 기능을 제공
- 또한 스프링 컨테이너가 종료되기 전에 소멸 콜백 제공
- 스프링 빈의 이벤트 라이프사이클
  - 스프링 컨테이너 생성
  - 스프링 빈 생성
  - 의존관계 주입
  - 초기화 콜백
    - 빈이 생성되고, 빈의 의존관계 주입이 완료된 후 호출
  - 사용
  - 소멸전 콜백
    - 빈이 소멸되기 직전에 호출
  - 스프링 종료

<aside>
👻 **객체의 생성과 초기화를 분리하자**
생성자는 필수 정보를 받고 메모리를 할당해서 객체를 생성
초기화는 생성된 값을 활용해서 외부 커넥션을 연결하는 무거운 동작을 수행
그래서 둘을 분리하는 게 유지보수 관점에서 좋음
초기화 작업이 내부 값들만 약간 변경하는 정도는 생성자에서 처리하는 게 나음

</aside>

<aside>
👻 싱글톤 빈들은 스프링 컨테이너가 종료될 때 싱글톤 빈들도 함께 종료되기 때문에 스프링 컨테이너가 종료되기 직전에 소멸 전 콜백이 일어난다

</aside>

- 스프링은 3가지 방법으로 빈 생명주기 콜백을 지원
  - 인터페이스(IntializingBean, DisposableBean)
  - 설정 정보에 초기화 메서드, 종료 메서드 지정
  - @PostConstruct, @PreDestoy 애노테이션 지원

## 인퍼테이스 IntializingBean, DisposableBean

```java
package hello.core.lifecycle;

import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;

public class NetworkClient implements InitializingBean, DisposableBean {

    private String url;

    public NetworkClient( ) {
        System.out.println("생성자 호출, url = " + url);

    }

    public void setUrl(String url) {
        this.url = url;
    }

    public void connect() {
        System.out.println("connect: " + url);
    }

    public void call(String message) {
        System.out.println("call " + url + " message = " + message);
    }

    public void disconnect() {
        System.out.println("close: " + url);
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        connect();
        call("초기화 연결 메시지");
    }

    @Override
    public void destroy() throws Exception {
        disconnect();
    }
}
```

- InitializingBean
  - 초기화 끝나고 `afterPropertiesSet` 메서드 실행
- DisposableBean
  - 소멸이 끝나고 `destroy` 메서드 실행
- 초기화, 소멸 인터페이스 단점
  - 이 인터페이스는 스프링 전용 인터페이스, 해당 코드가 스프링 전용 인터페이스에 의존
  - 초기화, 소멸 메서드의 이름을 변경 불가능
  - 내가 코드를 고칠 수 없는 외부 라이브러리에 적용할 수 없다.

<aside>
👻 인터페이스를 사용하는 초기화, 종료 방법은 스프링 초창기에 나온 방법
**지금은 더 나은 방법들이 있어서 거의 사용 X**

</aside>

## 빈 등록 초기화, 소멸 메서드

- 설정 정보에 @Bean(initMethod = "init", destroyMethod = "close") 처럼 초기화, 소멸 메서드를 지정 가능
- 위에 부분은 동일 / afterPropertiesSet과 destory만 변경
  ```java
   		public void init() {
          System.out.println("NetworkClient.init");
          connect();
          call("초기화 연결 메시지");
      }

      public void close() {
          System.out.println("NetworkClient.close");
          disconnect();
      }
  }
  ```
- 설정 정보
  ```java
  @Configuration
      static class LifeCycleConfig {

          @Bean(initMethod = "init", destroyMethod = "close")
          public NetworkClient networkClient() {
              NetworkClient networkClient = new NetworkClient();
              networkClient.setUrl("http://hello-spring.dev");
              return networkClient;
          }
      }
  ```
- 설정 정보 사용 특징
  - 메서드 이름을 자유롭게 줄 수 있다
  - 스프링 빈이 스프링 코드에 의존하지 않는다
  - 코드가 아니라 설정 정보를 사용하기 때문에 코드를 고칠 수 없는 외부 라이브러리에도 초기화, 종료 메서드를 사용할 수 있다
- 종료 메서드 추론
  - @Bean의 destoryMethod 속성에는 아주 특별한 기능이 있다
  - 라이브러리는 대부분 close, shut dwon이라는 이름의 종료 메서드 사용
  - @Bean의 destoryMethod는 기본값이 (inferred)(추론)으로 등록되어 있다.
  - 이 추론 기능은 close, shutdown 라는 이름의 메서드를 자동으로 호출해준다.
  - 따라서 직접 스프링 빈으로 등록하면 종료 메서드는 따로 적어주지 않아도 잘 동작한다
  - 추론 기능을 사용하기 싫으면 destoryMethod=””처럼 빈 공백을 지정하면 된다.

## 애노테이션 @PostConstruct, @PreDestroy

```java
package hello.core.lifecycle;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

public class NetworkClient {

    @PostConstruct
    public void init() {
        System.out.println("NetworkClient.init");
        connect();
        call("초기화 연결 메시지");
    }
    @PreDestroy
    public void close() {
        System.out.println("NetworkClient.close");
        disconnect();
    }
}
```

- @PostConstruct, @PreDestroy를 사용하면 간단하게 초기화와 종료 콜백을 사용 가능
- 특징
  - 최신 스프링에서 가장 권장하는 방법
  - 애노테이션 하나만 붙이면 되므로 매우 편리
  - 컴포넌트 스캔과 잘 어울림
  - 유일한 단점
    - 외부 라이브러리에는 적용 불가

### 정리

- **@PostConstruct, @PreDestroy 애노테이션을 사용하자**
- 코드를 고칠 수 없는 외부 라이러리는 빈 등록 초기화, 소멸 메서드를 사용하자
