# Section05\_싱글톤 컨테이너

## 웹 애플리케이션과 싱글톤

- 스프링 애플리케이션은 대부분 웹 애플리케이션
  - 웹 애플리케이션은 보통 여러 고객이 동시에 요청
  - 우리가 만든 스프링 없는 순수한 DI 컨테이너인 AppConfig는 요청을 할 때 마다 객체를 새로 생성
    - 고객 트래픽이 초당 100이 나오면 초당 100개 객체가 생성되고 소멸
      - 메모리 낭비가 심하다
    - 해결방안은 해당 객체가 딱 1개만 생성되고 공유하도록 설계
      - 싱글톤 패턴

## 싱글톤 패턴

- 클래스의 인스턴스가 딱 1개만 생성되는 것을 보장하는 디자인 패턴
- 그래서 객체 인스턴스를 2개 이상 생성하지 못하도록 막아야 한다
  - private 생성자를 사용해 외부에서 임의로 new 키워드를 사용하지 못하도록 막는다

```java
package hello.core.singleton;

public class SingletonService {
		// 싱글톤 객체 생성
    private static final SingletonService instance = new SingletonService();
		// 호출할 때 이미 생성된 객체를 호출
    public static SingletonService getInstance() {
        return instance;
    }
		// private 생성자로 new 키워드 사용 막기
    private SingletonService() {
    }
    public void logic() {
        System.out.println("싱글톤 객체 로직 호출");
    }
}
```

```java
// 테스트 코드
package hello.core.singleton;

import hello.core.AppConfig;
import hello.core.member.MemberService;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.lang.model.SourceVersion;

public class SingletonTest
    @Test
    @DisplayName("싱글톤 패턴을 적용한 객체 사용")
    void singletonServiceTest() {
        SingletonService instance1 = SingletonService.getInstance();
        SingletonService instance2 = SingletonService.getInstance();

        Assertions.assertThat(instance1).isSameAs(instance2);
    }
}
```

> 싱글톤 패턴을 구현하는 방법은 여러가지가 있다.
> 여기서는 객체를 미리 생성해두는 가장 단순하고 안전한 방법을 선택

- 싱글톤 패턴의 장점
  - 고객의 요청이 올 때마다 객체를 생성하는 것이 아니라 이미 만들어진 객체를 공유해서 효율적으로 사용 가능
- 싱글톤 패턴의 단점
  - 싱글톤 패턴을 구현하는 코드 자체가 많이 들어간다
  - 의존관계상 클라이언트가 구체 클래스에 의존(getInstance) → DIP를 위반
  - 클라이언트가 구체 클래스에 의존해서 OCP 원칙을 위반할 가능성이 높다
  - 테스트하기 어렵다
  - 내부 속성을 변경하거나 초기화 하기 어렵다
  - private 생성자로 자식 클래스를 만들기 어렵다
  - 유연성이 떨어진다
  → 안티패턴으로 불리기도 한다

## 싱글톤 컨테이너

- 스프링 컨테이너는 싱글톤 패턴의 문제점을 해결하면서, 객체 인스턴스를 싱글톤(1개만 생성)으로 관리
  - 스프링 빈이 싱글톤으로 관리되는 빈
- 싱글톤 컨테이너
  - 스프링 컨테이너는 싱글턴 패턴을 적용하지 않아도, 객체 인스턴스를 싱글톤으로 관리
    - 이전에 스프링 빈 생성하는 표를 보면 객체를 하나만 생성해서 관리
  - 스프링 컨테이너는 싱글톤 컨테이너 역할
    - 싱글톤 객체를 생성하고 관리하는 기능을 싱글톤 레지스트리라고 한다
  - 스프링 컨테이너의 이런 기능 덕분에 싱글턴 패턴의 모든 단점을 해결하면서도 객체를 싱글톤으로 유지 가능
    - 싱글톤 패턴을 위한 지저분한 코드가 들어가지 않아도 된다
    - DIP, OCP, 테스트, private 생성자로부터 자유롭게 싱글톤을 사용 가능
  - 스프링 컨테이너를 사용하는 테스트 코드
    ```java
    @Test
        @DisplayName("스프링 컨테이너와 싱글톤")
        void springContainer() {
            ApplicationContext ac = new AnnotationConfigApplicationContext(AppConfig.class);
            MemberService memberService1 = ac.getBean("memberService", MemberService.class);
            MemberService memberService2 = ac.getBean("memberService", MemberService.class);

            System.out.println("memberService1 = " + memberService1);
            System.out.println("memberService2 = " + memberService2);

            Assertions.assertThat(memberService1).isSameAs(memberService2);

    ```
- 싱글톤 컨테이너 적용 후

> 스프링의 기본 빈 등록 방식은 싱글톤이지만. 싱글톤 방식만 지원하는 것은 아니다.

    요청할 때마다 새로운 객체를 생성해서 반환하는 기능도 제공

## 싱글톤 방식의 주의점

- 싱글톤 패턴이든, 스프링 같은 싱글톤 컨테이너를 사용하든, 객체 인스턴스를 하나만 생성해서 공유하는 방식은 여러 클라이언트가 하나의 같은 객체 인스턴스를 공유하기 때문에 싱글톤 객체는 상태 유지(stateful)하게 설계하면 안된다
- 무상태(stateless)로 설계해야 한다!
  - 특정 클라이언트에 의존적인 필드가 있으면 안된다
  - 특정 클라이언트가 값을 변경할 수 있는 필드가 있으면 안된다
  - 가급적 읽기만 가능해야 한다
  - 필드 대신에 자바에서 공유되지 않는 지역변수, 파라미터, ThreadLocal 등을 사용해야 한다
- 스프링 빈의 필드에 공유 값을 설정하면 정말 큰 장애가 발생할 수 있다.
- 상태를 유지할 경우 발생하는 문제점 예시
  ```java
  package hello.core.singleton;

  public class StatefulService {

      private int price; // 상태를 유지하는 필드

      public void order(String name, int price) {
          System.out.println("name = " + name + " price = " + price);
          this.price = price; // 여기가 문제
      }

      public int getPrice() {
          return price;
      }
  }
  ```
- 상태를 유지할 경우 발생하는 문제점 발생 코드 예시
  ```java
  package hello.core.singleton;

  import org.assertj.core.api.Assertions;
  import org.junit.jupiter.api.Test;
  import org.junit.jupiter.api.TestTemplate;
  import org.springframework.context.ApplicationContext;
  import org.springframework.context.annotation.AnnotationConfigApplicationContext;
  import org.springframework.context.annotation.Bean;

  import static org.assertj.core.api.Assertions.*;
  import static org.junit.jupiter.api.Assertions.*;

  class StatefulServiceTest {

      @Test
      void statefulServiceSingleton() {
          ApplicationContext ac = new AnnotationConfigApplicationContext(TestConfig.class);
          StatefulService statefulService1 = ac.getBean(StatefulService.class);
          StatefulService statefulService2 = ac.getBean(StatefulService.class);

          //ThreadA : A사용자 10000원 주문
          statefulService1.order("userA", 10000);
          //ThreadB : B사용자 20000원 주문
          statefulService2.order("userB", 20000);

          //ThreadA: A사용자 주문 금액 조회
          int price = statefulService1.getPrice();
          System.out.println("price = " + price);

          assertThat(statefulService1.getPrice()).isEqualTo(20000);
      }

      static class TestConfig {

          @Bean
          public StatefulService statefulService() {
              return new StatefulService();
          }
      }

  }
  ```
- 최대한 단순하게 설명하기 위해 실제 쓰레드는 사용 X
- ThreadArk 사용자 A 코드를 호출하고 ThreadB가 사용자 B 코드를 호출한다 가정
- StatefulService의 price 필드는 공유되는 필드인데. 특정 클라이언트가 값을 변경
- 사용자 A의 주문금액은 10000원이 되어야 하는데, 20000원이 출력
- 실무에서 이런 경우를 종종 보는데, 이러면 정말 해결하기 어려운 큰 문제들이 생긴다
- **공유필드는 정말 조심해야 한다**. 스프링 빈은 항상 무상태(stateless)로 설계하자

## @Configuration과 싱글톤

```java
package hello.core;

@Configuration
public class AppConfig {
    @Bean
    public MemberService memberService() {
        System.out.println("call AppConfig.memberService");
        return new MemberServiceImpl(memberRepository());
    }
    @Bean
    public MemberRepository memberRepository() {
        System.out.println("call AppConfig.memberRepository");
        return new MemoryMemberRepository();
    }
    @Bean
    public OrderService orderService() {
        System.out.println("call AppConfig.orderService");
        return new OrderServiceImpl(memberRepository(), discountPolicy());
    }
    @Bean
    public DiscountPolicy discountPolicy() {
//        return new FixDiscountPolicy();
        return new RateDiscountPolicy();
    }
}
```

- AppConfig는 자바 코드이고, memService와 orderService 빈을 만드는 코드를 보면
  - 둘 다 new MemoryMemberRepository를 호출해서 싱글톤이 깨지는 것 같이 보인다
- 이를 테스트 해보자
- 각각의 구현 코드에서 생성된 구현체를 반환하는 코드를 테스트를 위해 추가
  ```java
  public MemberRepository getMemberRepository() {
          return memberRepository;
      }
  ```
- 테스트 코드
  ```java
  package hello.core.singleton;

  import hello.core.AppConfig;
  import hello.core.member.MemberRepository;
  import hello.core.member.MemberServiceImpl;
  import hello.core.order.OrderServiceImpl;
  import org.assertj.core.api.Assertions;
  import org.junit.jupiter.api.Test;
  import org.springframework.context.ApplicationContext;
  import org.springframework.context.annotation.AnnotationConfigApplicationContext;

  public class ConfugurationsSingletonTest {

      @Test
      void configurationTest() {
          ApplicationContext ac = new AnnotationConfigApplicationContext(AppConfig.class);

          MemberServiceImpl memberService = ac.getBean("memberService", MemberServiceImpl.class);
          OrderServiceImpl orderService = ac.getBean("orderService", OrderServiceImpl.class);
          MemberRepository memberRepository = ac.getBean("memberRepository", MemberRepository.class);

          MemberRepository memberRepository1 = memberService.getMemberRepository();
          MemberRepository memberRepository2 = orderService.getMemberRepository();

          System.out.println("memberService -> memberRepository = " + memberRepository1);
          System.out.println("orderService -> memberRepository = " + memberRepository2);

          Assertions.assertThat(memberService.getMemberRepository()).isSameAs(memberRepository);
          Assertions.assertThat(orderService.getMemberRepository()).isSameAs(memberRepository);
      }
  }
  ```
- 확인해보면 각각 다른 memberRepository 인스턴스를 생성하는 게 아니라 공유해서 사용한다
- 이를 호출 로그로도 작성해서 확인해보자
  ```java
  package hello.core;

  import hello.core.discount.DiscountPolicy;
  import hello.core.discount.FixDiscountPolicy;
  import hello.core.discount.RateDiscountPolicy;
  import hello.core.member.MemberRepository;
  import hello.core.member.MemberService;
  import hello.core.member.MemberServiceImpl;
  import hello.core.member.MemoryMemberRepository;
  import hello.core.order.OrderService;
  import hello.core.order.OrderServiceImpl;
  import org.springframework.context.annotation.Bean;
  import org.springframework.context.annotation.Configuration;

  @Configuration
  public class AppConfig {
      @Bean
      public MemberService memberService() {
          System.out.println("call AppConfig.memberService");
          return new MemberServiceImpl(memberRepository());
      }
      @Bean
      public MemberRepository memberRepository() {
          System.out.println("call AppConfig.memberRepository");
          return new MemoryMemberRepository();
      }
      @Bean
      public OrderService orderService() {
          System.out.println("call AppConfig.orderService");
          return new OrderServiceImpl(memberRepository(), discountPolicy());
      }
      @Bean
      public DiscountPolicy discountPolicy() {
  //        return new FixDiscountPolicy();
          return new RateDiscountPolicy();
      }
  }
  ```
- call ~ 코드를 통해 호출 로그를 보아도 memberRepository가 3번이 아닌 한 번만 생성된다

## @Configuration과 바이트코드 조작의 마법

- 스프링 컨테이너는 싱글톤 레지스트리
  - 스프링 빈이 싱글톤이 되도록 보장해야 한다
  - 하지만 스프링이 자바 코드까지 어떻게 하기는 어렵다
  - 그래서 스프링은 클래스의 바이트코드를 조작하는 라이브러리를 사용
    - 그 라이브러리가 @Configuration을 적용한 AppConfig
- @Configuration 의 마법을 확인해보자
  ```java
  @Test
      void configurationDeep() {
          ApplicationContext ac = new AnnotationConfigApplicationContext(AppConfig.class);
          AppConfig bean = ac.getBean(AppConfig.class);

          System.out.println("bean = " + bean.getClass());

      }
  ```
  - AnnotationConfigApplicationContext에 파라미터로 넘긴 값은 스프링 빈으로 등록
    - AppConfig도 스프링 빈이 된다
    - AppConfig 스프링 빈을 조회해서 클래스 정보를 출력
  - `bean = class hello.core.AppConfig$$EnhancerBySpringCGLIB$$bd479d70`
  - 순수한 클래스면 `class hello.core.AppConfig` 과 같이 출력되어야 한다
  - 이는 CGLIB라는 바이트코드 조작 라이브러리를 사용해서 AppConfig 클래스를 상속받은 임의의 다른 클래스를 만들고, 그 다른 클래스를 스프링 빈으로 등록한 것
  - 그 임의의 다른 클래스가 싱글톤을 보장
  - 바이트 코드를 조작하는 라이브러리 코드를 간단하게 표현하면 이렇다
    ```java
    @Bean
    public MemberRepository memberRepository() {

    	if (memoryMemberRepository가 이미 스프링 컨테이너에 등록되어 있으면?) {
    			return 스프링 컨테이너에서 찾아서 반환;
      } else { //스프링 컨테이너에 없으면
    			기존 로직을 호출해서 MemoryMemberRepository를 생성하고 스프링 컨테이너에 등록
    			return 반환
        }
    }
    ```
  - @Bean이 붙은 메서드마다
    - 이미 스프링 빈이 존재하면 존재하는 빈을 반환
    - 스프링 빈이 없으면 생성해서 스프링 빈으로 등록하고 반환
  - 덕분에 싱글톤이 보장된다

> AppConfig@CGLIB의 부모가 AppConfig이므로 AppConfig 타입으로 조회 가능

- @Configuration을 적용하지 않고 @Bean만 적용하면 어떻게 될까?
- CGLIB 기술이 없는 순수한 AppConfig로 스프링 빈에 등록
- 그럼 위에서 memberRepository도 총 3번 호출
  - 각기 다른 객체 생성

### 정리

- @Bean만 사용해도 스프링 빈으로 등록되지만, 싱글톤을 보장하지는 않는다
  - memberRepository() 처럼 의존관계 주입이 필요해서 메서드를 직접 호출할 때 싱글톤이 보장하지는 않는다
- 그냥 스프링 설정 정보 (Config)에는 항상 @Configuration을 사용하면 된다
