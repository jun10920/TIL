# Section07\_의존관계 자동 주입

## 다양한 의존관계 주입 방법

- 의존관계 주입의 종류
  - 생성자 주입
  - 수정자 주입(setter 주입)
  - 필드 주입
  - 일반 메서드 주입
- 생성자 주입
  - 특징
    - 생성자 호출시점에 딱 1번만 호출되는 것이 보장
    - 불변, 필수 의존관계에 사용
  ```java
  @Component
  public class OrderServiceImpl implements OrderService {

      private final MemberRepository memberRepository;
      private final DiscountPolicy discountPolicy;

      @Autowired
      public OrderServiceImpl(MemberRepository memberRepository, DiscountPolicy discountPolicy) {
          this.memberRepository = memberRepository;
          this.discountPolicy = discountPolicy;
      }
  ```
  - 생성자가 1개만 있으면 `@Autowired`를 생략해도 자동 주입
    - 스프링 빈에만 해당된다
- 수정자 주입(setter 주입)
  - setter라 불리는 필드의 값을 변경하는 수정자 메서드를 통해서 의존관계 주입
  - 특징
    - 선택, 변경이 가능성이 있는 의존관게 사용
    - 자바빈 프로퍼티 규약의 수정자 메서드 방식을 사용하는 방법
  ```java
  @Component
  public class OrderServiceImpl implements OrderService {

      private  MemberRepository memberRepository;
      private  DiscountPolicy discountPolicy;

      @Autowired(required = false)
      public void setMemberRepository(MemberRepository memberRepository) {
          this.memberRepository = memberRepository;
      }

      @Autowired
      public void setDiscountPolicy(DiscountPolicy discountPolicy) {
          this.discountPolicy = discountPolicy;
      }
  ```
  - `@Autowired`의 기본 동작은 주입할 대상이 없으면 오류가 발생
  - 주입할 대상이 없어도 동작하게 하려면 `@Autowired(required = false)`로 지정
  - **자바빈 프로퍼티 규약**
    - gettter와 setter를 이용해서 값을 읽거나 수정하는 규칙
- 필드 주입
  - 특징
    - 코드가 간결해서 많은 개발자들을 유혹하지만 외부에서 변경이 불가능해서 테스트 하기 힘들다는 치명적인 단점 존재
    - DI 프레임워크가 없으면 아무것도 할 수 없다
      - 스프링 컨테이너를 통해서만 사용이 가능하다
    - 아래 상황을 제외하고는 사용하지 말자
      - 애플리케이션의 실제 코드와 관계 없는 테스트 코드
      - 스프링 설정을 목적으로 하는 `@Configuration` 같은 곳에서만 특별한 용도로 사용
  ```java
  @Component
  public class OrderServiceImpl implements OrderService {

      @Autowired private  MemberRepository memberRepository;
      @Autowired private  DiscountPolicy discountPolicy;
  ```
  - 순수한 자바 테스트 코드에는 `@Autowired` 동작 X
    - `@SpringBootTest` 처럼 스프링 컨테이너를 테스트에 통한 경우에만 가능
  - 다음 코드와 같이 @Bean에서 파라미터에 의존관계는 자동 주입
- 일반 메서드 주입
  - 특징
    - 한번에 여러 필드를 주입 받을 수 있다
    - 일반적으로 잘 사용하지 않는다
  ```java
  @Component
  public class OrderServiceImpl implements OrderService {
      private MemberRepository memberRepository;

      private DiscountPolicy discountPolicy;

      @Autowired
      public void init(MemberRepository memberRepository, DiscountPolicy discountPolicy) {
          this.memberRepository = memberRepository;
          this.discountPolicy = discountPolicy;
      }
  ```

> 의존관계 자동 주입은 스프링 컨테이너가 관리하는 스프링 빈이어야 동작
> 일반 객체 클래스에는 @Autowired 코드를 적용해도 아무 기능도 동작하지 않는다

## 옵션 처리

- 주입할 스프링 빈이 없어도 동작해야 할 때가 있다
- @Autowired만 사용하면 required 옵션이 기본값이 true로 되어 있어서 자동 주입 대상이 없으면 오류가 발생한다
- 자동 주입 대상을 옵션으로 처리하는 방법은 다음과 같다
  - @Autowired(required=false)
    - 자동 주입할 대상이 없으면 수정자 메서드 자체가 호출 안됨
  - org.springframework.lang.@Nullable
    - 자동 주입할 대상이 없으면 null이 입력
  - Optional<>
    - 자동 주입할 대상이 없으면 Optional.empty가 입력

```java
package hello.core.autowired;
public class AutowiredOption {

    @Test
    void AutoWiredOption() {
        ApplicationContext ac = new AnnotationConfigApplicationContext(TestBean.class);
    }

    static class TestBean {

        @Autowired(required = false)
        public void setNoBean(Member noBean1) {
            System.out.println("noBean1 = " + noBean1);
        }

        @Autowired
        public void setNoBean2(@Nullable Member noBean2) {
            System.out.println("noBean2 = " + noBean2);
        }

        @Autowired
        public void setNoBean3(Optional<Member> noBean3) {
            System.out.println("noBean3 = " + noBean3);
        }
    }
}
```

- 출력결과

```java
noBean2 = null
noBean3 = Optional.empty
```

- Member는 스프링 빈이 아니라 일반 클래스

> @Nullable, Optional은 스프링 전반에 걸쳐서 지원
> 예를 들어서 생성자 자동 주입에서 특정 필드에만 사용 가능

## 생성자 주입을 선택해라

- 과거와 다르게 현재는 생성자 주입을 주로 사용한다. 그 이유는 아래와 같다
- 불변
  - 대부분의 의존관계 주입은 초기에 하고 종료시점까지 의존관계를 변경할 일이 없다
    - 오히려 대부분은 변하면 안된다
  - 수정자 주입을 사용하면, set 메서드를 public으로 열어두어야 한다
    - 누군가 실수로 변경하면 안되는 메서드를 열어두는 것은 좋은 설계 방법이 아니다
  → 따라서 생성자 주입은 초기에 한 번만 실행되므로 불변하게 설계할 수 있다
- 누락
  - 프레임워크 없이 순수한 자바 코드를 단위 테스트 하는 경우
    - 수정자 의존 관계 주입인 경우
      ```java
      private final MemberRepository memberRepository;

          private final DiscountPolicy discountPolicy;

          public void setDiscountPolicy(DiscountPolicy discountPolicy) {
              this.discountPolicy = discountPolicy;
          }

          public void setMemberRepository(MemberRepository memberRepository) {
              this.memberRepository = memberRepository;
          }
      ```
    - 테스트 결과
      ```java
      package hello.core.order;

      import static org.junit.jupiter.api.Assertions.*;

      class OrderServiceImplTest {
          @Test
          void createOrder() {
              OrderServiceImpl orderService = new OrderServiceImpl(new MemoryMemberRepository(), new FixDiscountPolicy());
              Order order = orderService.createOrder(1L, "itemA", 10000);
              Assertions.assertThat(order.getDiscountPrice()).isEqualTo(1000);
          }
      }
      ```
      - NPE(Null Point Exception)이 발생
        - 이는 setter를 통해서 의존관계를 주입하지 않았으므로 의존관계 주입이 누락됐기 때문이다
      - 생성자 주입을 사용하면 위와 같은 경우일 때 컴파일 오류가 발생한다
        - 매개변수가 비어있으므로
- final 키워드
  - 생성자 주입을 사용하면 필드에 final 키워드를 사용할 수 있다
  - 혹시라도 값이 설정되지 않는 오류를 컴파일 시점에서 막아준다
    ```java
    @Component
    public class OrderServiceImpl implements OrderService {
        private final MemberRepository memberRepository;

        private final DiscountPolicy discountPolicy;

            @Autowired
        public OrderServiceImpl(MemberRepository memberRepository, DiscountPolicy discountPolicy) {
            this.memberRepository = memberRepository;
        }
    ```
  - 필수 필드에 discountPolicy에 값을 설정해야 하는데 이 부분이 누락되었다.
  - 그래서 컴파일 시점에 오류를 발생시킨다
  - `java: variable discountPolicy might not have been initialized`
  > 수정자 주입을 포함한 나머지 주입 방식은 모두 생성자 이후에 호출되므로, 필드에 final 키워드를 사용할 수 없다. 오직 생성자 주입 방식만 final 키워드를 사용 가능
- 생성자 주입 방식은 프레임워크에 의존하지 않고 순수한 자바 언어의 특징을 가장 잘 살린다
- 기본으로 생성자 주입을 사용하고, 필수 값이 아닌 경우에는 수정자 주입 방식을 옵션으로 부여하면 된다.
- 항상 생성자 주입을 사용해라. 그리고 가끔 옵션이 필요하면 수정자 주입을 선택해라
  - 필드 주입은 사용하지 않는 게 좋다

## 롬복과 최신 트렌드

- 개발을 해보면 대부분이 다 불변이고 final을 사용한다
- 마치 생성자 주입을 필드 주입처럼 간단하게 사용할 방법이 없을까?

→ 롬복 라이브러리를 사용하면 된다

- 롬복 라이브러리
  ```java
  package hello.core;
  import lombok.Getter;
  import lombok.Setter;
  import lombok.ToString;

  @Getter
  @Setter
  @ToString
  public class HelloLombok {

      private String name;
      private int age;

      public static void main(String[] args) {
          HelloLombok helloLombok = new HelloLombok();
          helloLombok.setName("asdfas");

          String name = helloLombok.getName();
          System.out.println("helloLombok = " + helloLombok);
      }
  }
  ```
- 애노테이션을 통해서 getter, setter를 비롯해서 다양한 메서드들을 넣어주는 라이브러리다
- 이를 통해서 생성자 주입 코드를 수정하면?
  ```java
  @Component
  @RequiredArgsConstructor
  public class OrderServiceImpl implements OrderService {
      private final MemberRepository memberRepository;
      private final DiscountPolicy discountPolicy;
  ```
- 정리
  - 최근에는 생성자를 1개만 두고(오버로딩 하지 않고) `@Autowired`를 생략하는 방법을 주로 사용한다.
  - 여기서 Lombok 라이브러리의 `@RequiredArgsConstructor` 기능을 제공하여 코드를 깔끔하게 사용한다

## 조회 대상 빈이 2개 이상 - 문제

- @Autowired는 타입(Type)으로 조회
  - ac.getBean(DiscountPolicy.class) 같이 동작
- 그럼 `DiscountPolicy`의 하위 타입인 `FixDiscountPolicy`와 `RateDiscountPolicy`둘 다 스프링 빈으로 선언하면 같은 DiscountPolicy로 인식해서 에러가 발생
  - `NoUniqueBeanDefinitionException`
- 아예 하위 타입으로 지정할 수 있지만
  - DIP를 위반하고 유연성이 떨어진다
  - 그리고 이름만 다르고 완전히 똑같은 타입의 스프링 빈이 중복될 때 해결이 안된다

## @Autowired 필드 명, @Qualifier, @Primary

- 소제목과 같이 조회 대상 빈이 2개 이상일 때 해결 방법은 3 가지
  - @Autowired 필드 명
  - @Qualifier → @Qualifier끼리 매칭 → 빈 이름 매칭
  - @Primary
- @Autowired 필드 명, 파라미터 명 매칭
  - 기존 코드
    ```java
    @Autowired
    private DiscountPolicy discountPolicy
    ```
  - 필드 명을 빈 이름으로 변경
    ```java
    @Autowired
    private DiscountPolicy rateDiscountPolicy
    ```
  - 필드명이 rateDiscountPolicy로 정상 주입
    - 타입 매칭을 시도하고 여러 개가 조회될 때 추가로 동작하는 기능
- @Qualifier 사용
  - 추가 구분자를 붙여서 구분하는 방법, 빈 이름을 바꾸는 것은 아니다
    ```java
    @Component
    @Qualifier("mainDiscountPolicy")
    public class RateDiscountPolicy implements DiscountPolicy {}
    ```
  - 생성자 자동 주입 예시
    ```java
    @Autowired
    public OrderServiceImpl(MemberRepository memberRepository,
                            @Qualifier("mainDiscountPolicy") DiscountPolicy
    discountPolicy) {
    this.memberRepository = memberRepository;
    this.discountPolicy = discountPolicy;
    }
    ```
  - @Qualifier 사용 시 @Qualifier(”mainDiscountPolicy”)를 못 찾는 경우
    - mainDiscountPolicy라는 이름의 스프링 빈을 추가로 찾는다
    - 하지만 @Qualifier끼리 검색하는 용도로만 사용하는 것을 권장
    - 빈 등록 시에도 사용 가능
      ```java
      @Bean
      @Qualifier("mainDiscountPolicy")
      public DiscountPolicy discountPolicy() {
      return new ...
      ```
- @Primary 사용
  - 우선순위를 정하는 방법, @Primary가 여러 개 조회된 빈 중에서 우선권을 가진다
  - 빈 설정 예시
    ```java
    @Component
    @Primary
    public class RateDiscountPolicy implements DiscountPolicy {}
    @Component
    public class FixDiscountPolicy implements DiscountPolicy {}
    ```
  - 사용 코드
    ```java
    //생성자
    @Autowired
    public OrderServiceImpl(MemberRepository memberRepository,
    DiscountPolicy discountPolicy) {
    this.memberRepository = memberRepository;
    this.discountPolicy = discountPolicy;
    }
    //수정자
    @Autowired
    public DiscountPolicy setDiscountPolicy(DiscountPolicy discountPolicy) {
    this.discountPolicy = discountPolicy;
    }
    ```
- 언제 @Primary를 사용하고 언제 @Qualifier를 사용하는 것이 나을까?
  - 코드에서 메인으로 사용하는 데이터베이스의 커넥션을 획득하는 스프링 빈과 가끔 특별한 용도로 사용하는 서브 데이터베이스의 커넥션을 획득하는 스프링 빈이 있다고 가정
  - 이때 기본으로 @Primary를 사용하고 서브를 사용할 때만 명시적으로 @Qualifier를 지정으로 사용
- 우선순위
  - 범위가 넓은 @Primary보다 @Qualifier가 우선 순위가 높다

## 애노테이션 직접 만들기

- `@Qualifier("mainDiscountPolicy")` 이렇게 적으면 컴파일시 타입 체크가 안된다
- 이런 경우 애노테이션을 직접 만들어서 사용하면 된다
- 예시 코드
  ```java
  package hello.core.annotation;

  import org.springframework.beans.factory.annotation.Qualifier;

  import java.lang.annotation.*;

  @Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER, ElementType.TYPE, ElementType.ANNOTATION_TYPE})
  @Retention(RetentionPolicy.RUNTIME)
  @Inherited
  @Documented
  @Qualifier("mainDiscountPolicy")
  public @interface MainDiscountPolicy {
  }
  ```
  ```java
  @MainDiscountPolicy
  public class RateDiscountPolicy implements DiscountPolicy {
  ```
  ```java
  public OrderServiceImpl(MemberRepository memberRepository, @MainDiscountPolicy DiscountPolicy discountPolicy) {
          this.memberRepository = memberRepository;
          this.discountPolicy = discountPolicy;
      }
  ```
- 애노테이션에는 상속 기능이 없다
  - 스프링에서 애노테이션을 타고 들어가서 여러 애노테이션을 모아서 사용하는 기능을 제공
  - 기존에 있는 애노테이션을 재정의 할 수 있다
  - 하지만 기존에 있는 기능을 뚜렷한 목적 없이 무분별하게 재정의 하는 것은 유지보수에 혼란을 일으키므로 삼가

## 조회한 빈이 모두 필요할 때, List, Map

- 해당 타입의 스프링 빈이 다 필요한 경우가 있다
  - 할인 서비스를 고객이 선택해서(fix, rate) 사용할 수 있는 경우
- 이때 스프링을 사용하면 전략 패턴을 쉽게 구현할 수 있다
  ```java
  package hello.core.autowired;

  import static org.assertj.core.api.Assertions.*;

  public class AllBeanTest {

      @Test
      void findAllName() {
          ApplicationContext ac = new AnnotationConfigApplicationContext(AutoAppConfig.class, DiscountService.class);

          DiscountService discountService = ac.getBean(DiscountService.class);
          Member member = new Member(1L, "userA", Grade.VIP);
          int discountPrice = discountService.discount(member, 10000, "fixDiscountPolicy");

          assertThat(discountService).isInstanceOf(DiscountService.class);
          assertThat(discountPrice).isEqualTo(1000);

          int rateDiscountPrice = discountService.discount(member, 20000, "rateDiscountPolicy");
          assertThat(rateDiscountPrice).isEqualTo(2000);
      }

      static class DiscountService {
          private final Map<String, DiscountPolicy> policyMap;
          private final List<DiscountPolicy> policies;

          @Autowired
          public DiscountService(Map<String, DiscountPolicy> policyMap, List<DiscountPolicy> policies) {
              this.policyMap = policyMap;
              this.policies = policies;
              System.out.println("policyMap = " + policyMap);
              System.out.println("policies = " + policies);
          }

          public int discount(Member member, int price, String discountCode) {
              DiscountPolicy discountPolicy = policyMap.get(discountCode);
              return discountPolicy.discount(member, price);
          }
      }
  }
  ```
- 로직 분석
  - DiscountService은 Map으로 모든 DiscountPolicy를 주입
  - `discount()` 는 discountCode로 넘어온 이름에 맞춰서 DiscountPolicy 스프링 빈을 찾아서 실행
- 주입 분석
  - Map<String, DiscountPolicy>
    - map의 키에 스프링 빈의 이름을 넣어주고, 그 값으로 DiscountPolicy 타입으로 조회한 모든 스프링 빈을 담아준다.
  - List<Discountpolicy>
    - DiscountPolicy 타입으로 조회한 모든 스프링 빈을 담아준다
  - 만약 해당하는 타입의 스프링 빈이 없으면 빈 컬렉션이나 Map을 주입한다
- 스프링 컨테이너를 생성하면서 스프링 빈 등록하기
  - 스프링 컨테이너는 생성자에 클래스 정보를 받는다.
  - `new AnnotationConfigApplicationContext(AutoAppConfig.class,DiscountService.class)`
    - `new AnnotationConfigApplicationContext()` 을 통해 스프링 컨테이너 생성
    - `AutoAppConfig.class,DiscountService.class` 를 파라미터로 넘기면서 해당 클래스를 자동으로 스프링 빈으로 등록

## 자동, 수동의 올바른 실무 운영 기준

- 편리한 자동 기능을 기본으로 사용하는 것을 권장
  - 스프링은 @Component 뿐만 아니라 @Controller, @Service, @Repository처럼 계층에 맞추어 일반적인 애플리케이션 로직을 자동으로 스캔할 수 있도록 지원
  - 스프링 부트는 컴포넌트 스캔을 기본으로 사용하고, 스프링 부트의 다양한 스프링 빈들도 조건이 맞으면 자동으로 등록하도록 설계
  - 설정 정보를 기반으로 애플리케이션을 구성하는 부분과 실제 동작하는 부분을 명확하게 나누는 것이 이상적
  - 하지만 개발자 입장에서 스프링 빈을 등록할 때 @Component만 넣어주면 끝나는 일을 @Cofiguration 설정 정보에 가서 @Bean을 적고 객체를 생성하고 주입할 대상을 일일이 적어주는 과정은 상당히 번거로움
  - 결정적으로 자동 빈 등록을 사용해도 OCP, DIP를 지킬 수 있다
- 수동 빈 등록은 언제 사용하는 것이 좋을까?

  - 애플리케이션은 크게 업무 로직과 지원 로직으로 나눌 수 있다
  - 업무 로직 빈
    - 웹을 지원하는 컨트롤러, 핵심 비즈니스 로직이 있는 서비스, 데이터 계층의 로직을 처리하는 리포지토리등이 모두 업무 로직이다. 보통 비즈니스 요구사항을 개발할 때 추가되거나 변경된다.
    - 업무 로직은 매우 많고 유사한 패턴이 많으므로 자동 주입을 사용하는 것을 추천
  - 기술 지원 빈
    - 기술적인 문제나 공통 관심사(AOP)를 처리할 때 주로 사용된다. 데이터베이스 연결이나, 공통 로그 처리 처럼 업무 로직을 지원하기 위한 하부 기술이나 공통 기술들이다.
    - 기술 지원 로직은 그 수가 매우 적고, 애플리케이션 전반에 걸쳐서 광범위하게 영향을 미친다. 적용이 된 건지 문제가 어디서 터진 건지 파악하기가 어려우므로 수동 빈 등록을 이용해서 명확하게 드러내는 것이 좋다
  - 비즈니스 로직 중에서 다형성을 적극 활용할 때
    - 의존관계 자동 주입 - 조회한 빈이 모두 필요할 때 List, Map을 다시 보자
    - 다른 사람이 짠 코드라고 생각했을 때 Map에 들어있는 빈들의 이름이 무엇일지 한 번에 파악하기 어렵다
    - 이런 경우 파악을 쉽게 하기 위해 **수동 빈으로 등록하거나 특정 패키지에 같이 묶는 것을 추천**
      ```java
      @Configuration
      public class DiscountPolicyConfig {

          @Bean
      		public DiscountPolicy rateDiscountPolicy() {
      				return new RateDiscountPolicy();
          }
          @Bean
      		public DiscountPolicy fixDiscountPolicy() {
      				return new FixDiscountPolicy();
          }
      }
      ```

  > **스프링과 스프링 부트가 자동으로 등록하는 수많은 빈들은 예외**
  > DataSource 같은 데이터베이스 연결에 사용하는 기술 지원 로직까지 내부에서 자동으로 등록하는데, 이런 부분은 메뉴얼을 잘 참고해서 스프링 부트에서 의도한 대로 편리하게 사용하는 것을 추천
  > 직접 기술 지원 객체를 스프링 빈으로 등록한다면 수동으로 등록하는 것을 추천

  - 정리
    - 편리한 자동 기능을 기본으로 사용
    - 직접 등록하는 기술 지원 객체는 수동 등록
    - 다형성을 적극 활용하는 비즈니스 로직은 수동 등록을 고민
