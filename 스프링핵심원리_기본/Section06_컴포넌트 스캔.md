# Section06\_컴포넌트 스캔

## 컴포넌트 스캔과 의존관계 자동 주입 시작하기

- 지금까지 스프링 빈을 등록할 때는 자바의 @Bean이나 XML의 <bean>을 통해서 설정 정보에 등록할 스프링 빈을 나열
  - 예제에서는 몇 개 안되었지만 등록해야 할 스프링 빈이 수백 개가 되면 등록하기 힘들고, 설정 정보도 커지고, 누락하는 문제도 발생
- 그래서 스프링은 설정 정보가 없어도 자동으로 스프링 빈을 등록하는 컴포넌트 스캔 기능을 제공
  - 의존관계 주입 (DI)를 윙해서 @Autowired라는 기능도 제공
- AutoAppConfig 코드
  ```java
  package hello.core;

  import org.springframework.context.annotation.ComponentScan;
  import org.springframework.context.annotation.Configuration;
  import org.springframework.context.annotation.FilterType;

  @Configuration
  @ComponentScan(
          excludeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = Configuration.class)
  )
  public class AutoAppConfig {

  }
  ```
  - 컴포넌트 스캔을 사용하려면 @ComponentScan을 설정 정보에 붙여주면 된다.
  - 기존의 AppConfig와는 다르게 @Bean으로 등록한 클래스가 하나도 없다

> 컴포넌트 스캔을 사용하면 @Configuration이 붙은

        이전에 작성하였던 AppConfig 등 앞선 설정 정보들도 함께 등록되고 실행된다.
        그래서 excludeFilters를 이용해서 설정정보는 최대한 컴포넌트 스캔 대상에서 제외
        보통은 제외하지 않지만 이번이 특별한 경우



    - 컴포넌트 스캔은 이름 그대로 @Component 애노테이션이 붙은 클래스를 스캔해서 스프링 빈으로 등록
    - MemoryMemberRepository @Component 추가

        ```java
        @Component
        public class MemoryMemberRepository implements MemberRepository
        ```

    - RateDiscountPolicy @Component 추가

        ```java
        @Component
        public class RateDiscountPolicy implements DiscountPolicy
        ```

    - MemberServiceImpl @Component, @Autowired 추가

        ```java
        @Component
        public class MemberServiceImpl implements MemberService{

            private final MemberRepository memberRepository;

            @Autowired
            public MemberServiceImpl(MemberRepository memberRepository) {
                this.memberRepository = memberRepository;
            }
        ```

        - 이전에는 @Bean으로 직접 설정 정보와 함께 생성자로 의존관계도 직접 명시했다.
        - 이제는 설정 정보 자체가 없기 때문에 의존관계 주입도 이 클래스 안에서 해결한다
            - @Autowired가 의존관계를 자동으로 주입
    - OrderServiceImpl @Component, @Autowired 추가

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


- 테스트 코드
  ```java
  package hello.core.scan;

  import hello.core.AutoAppConfig;
  import hello.core.member.MemberService;
  import org.assertj.core.api.Assertions;
  import org.junit.jupiter.api.Test;
  import org.springframework.context.annotation.AnnotationConfigApplicationContext;

  import static org.assertj.core.api.Assertions.*;

  public class AutoAppConfigTest {

      @Test
      void basicScan() {
          AnnotationConfigApplicationContext ac = new AnnotationConfigApplicationContext(AutoAppConfig.class);

          MemberService memberService = ac.getBean(MemberService.class);
          assertThat(memberService).isInstanceOf(MemberService.class);
      }
  }
  ```
  - 설정 정보만 AutoAppConfig로 바뀐 상태고 나머진 똑같다
- 컴포넌트 스캔과 자동 의존관계 주입 그림

  1. @ComponentScan

     - @ComponentScan은 @Component가 붙은 모든 클래스를 스프링 빈으로 등록
     - 이때 스프링 빈의 기본 이름은 클래스명을 사용하되 맨 앞글자만 소문자를 사용
       - 빈 이름 기본 전략: MemberServiceImpl → memberServiceImpl
       - 빈 이름 직접 지정: @Componet(”memberService2”) 이런식으로 이름을 부여

  2. @Autowired

     - 생성자에 @Autowired를 지정하면, 스프링 컨테이너가 자동으로 해당 스프링 빈을 찾아서 주입
     - 이때 기본 조회 전략은 타입이 같은 빈을 찾아서 주입한다
     - getBean(MemberRepository.class)와 동일하다고 이해하면 된다

     - 생성자가 많아도 다 찾아서 자동으로 주입한다

## 탐색 위치와 기본 스캔 대상

### 탐색할 패키지의 시작 위치 지정

- 필요한 위치만 탐색하도록 시작 위치 지정 가능
  - 모든 자바 클래스를 다 컴포넌트 스캔하려면 시간이 너무 오래걸리기 때문
  ```java
  @ComponentScan(
          basePackages = "hello.core",
          basePackageClasses = AutoAppConfig.class,
  )
  ```
  - basePackages: 탐색할 패키지의 시작 위치 지정
    - 이 패키지를 포함해서 하위 패키지를 모두 탐색
  - basePackageClasses: 지정한 클래스의 패키지를 탐색 시작 위치로 지정
  - 만약 지정하지 않으면 @ComponentScan이 붙은 설정 정보 클래스의 패키지가 시작 위치
- 권장하는 방법
  - 패키지의 위치를 지정하지 않고 설정 정보 클래스의 위치를 프로젝트 최상단에 두는 것
    - 스프링 부트도 이 방법을 기본으로 제공
  - 예를 들어서 프로젝트 구조가 아래와 같다면
    - com.hello
    - com.hello.service
    - com.hello.repository
  - com.hello와 같은 프로젝트 시작 루트에
    - 메인 설정 정보 파일과 @ComponentScan 애노테이션을 붙이고 시작 위치 지정을 생략한다
  - 이렇게 하면 com.hello를 포함한 모든 하위 패키지는 자동으로 컴포넌트 스캔의 대상이 된다.
  - 참고로 스프링 부트를 사용하면 스프링 부트의 대표 시작 정보인 @SpringBootApplication를 프로젝트 시작 루트 위치에 두는 것이 관례이다
    - 이 설정 안에 @ComponentScan이 들어있어서 자동으로 하위 폴더 스캔

### 컴포넌트 스캔 기본 대상

- @Component : 컴포넌트 스캔에서 사용
- @Controller : 스프링 MVC 컨트롤러에서 사용
  - 스프링 MVC 컨트롤러로 인식
- @Service : 스프링 비즈니스 로직에서 사용
  - 특별한 기능은 없지만 개발자들이 핵심 비즈니스 로직이 있다고 인식
- @Repository : 스프링 데이터 접근 계층에서 사용
  - 스프링 데이터 접근 계층으로 인식하고 데이터 계층의 예외를 스프링 예외로 변환
- @Configuration : 스프링 설정 정보에서 사용
  - 스프링 설정 정보로 인식하고, 스프링 빈이 싱글톤을 유지하도록 추가 처리

<aside>
⚠️ 애노테이션에는 상속관계가 없다. 단지 스프링이 애노테이션 안에 특정 애노테이션이 있다는 사실을 인식할 수 있는 기능이 있을 뿐이다

</aside>

## 필터

- includeFilters: 컴포넌트 스캔 대상을 추가로 지정
- excludeFilters: 컴포넌트 스캔에서 제외할 대상을 지정
- 컴포넌트 스캔 대상에 추가할 애노테이션
  ```java
  package hello.core.scan.filter;

  import java.lang.annotation.*;

  @Target(ElementType.TYPE)
  @Retention(RetentionPolicy.RUNTIME)
  @Documented
  public @interface MyIncludeComponent {
  }
  ```
- 컴포넌트 스캔 대상에서 제외할 애노테이션
  ```java
  package hello.core.scan.filter;

  import java.lang.annotation.*;

  @Target(ElementType.TYPE)
  @Retention(RetentionPolicy.RUNTIME)
  @Documented
  public @interface MyExcludeComponent {
  }
  ```
- 컴포넌트 스캔 대상에 추가할 클래스
  ```java
  package hello.core.scan.filter;

  @MyIncludeComponent
  public class BeanA {
  }
  ```
- 컴포넌트 스캔 대상에 제외할 클래스
  ```java
  package hello.core.scan.filter;

  @MyExcludeComponent
  public class BeanB {
  }
  ```
- 전체 테스트 코드
  ```java
  package hello.core.scan.filter;

  public class ComponentFilterAppConfigTest {

      @Test
      void filterScan() {
          ApplicationContext ac = new AnnotationConfigApplicationContext(ComponentFilterAppConfig.class);
          BeanA beanA = ac.getBean("beanA", BeanA.class);
          assertThat(beanA).isNotNull();

          assertThrows(
                  NoSuchBeanDefinitionException.class,
                  () -> ac.getBean("beanB", BeanB.class));
      }

      @Configuration
      @ComponentScan(
              includeFilters = @Filter(type = FilterType.ANNOTATION, classes = MyIncludeComponent.class),
              excludeFilters = @Filter(type = FilterType.ANNOTATION, classes = MyExcludeComponent.class)

      )
      static class ComponentFilterAppConfig {

      }
  }
  ```
  - includeFilters에서 MyIncludeComponent 애노테이션을 추가해서 BeanA 등록
  - excludeFilters에서 MyExcludeComponent 애노테이션을 추가해서 BeanB 등록

### FilterType 옵션

- 총 5가지
  - ANNOTATION: 기본값, 애노테이션을 인식해서 동작한다.
    - ex) `org.example.SomeAnnotation`
  - ASSIGNABLE_TYPE: 지정한 타입과 자식 타입을 인식해서 동작한다.
    - ex) `org.example.SomeClass`
  - ASPECTJ: AspectJ 패턴 사용
    - ex) `org.example..*Service+*`
  - _REGEX: 정규 표현식_
    - _ex) `org\.example\.Default.`_
  - CUSTOM: TypeFilter 이라는 인터페이스를 구현해서 처리
    - ex) `org.example.MyTypeFilte`
- 예시
  - BeanA를 제외하고 싶고 ASIGNABLE_TYPE을 이용하는 경우
    ```java
    @Configuration
        @ComponentScan(
                includeFilters = {
                        @Filter(type = FilterType.ANNOTATION, classes = MyIncludeComponent.class)
                },
                excludeFilters = {
                        @Filter(type = FilterType.ANNOTATION, classes = MyExcludeComponent.class),
                        @Filter(type = FilterType.ASSIGNABLE_TYPE, classes = BeanA.class)
                }
        )
    ```
- 추가할 때는 @Component면 충분해서 includeFilter를 사용할 일은 거의 없다
  - excludeFilter는 간혹 사용
- 하지만 스프링 부트에서 컴포넌트 스캔을 기본으로 제공하므로 웬만하면 기본 설정에 맞춰서 사용하는 것을 권장

## 중복 등록과 충돌

- 자동 빈 등록 vs 자동 빈 등록
  - 컴포넌트 스캔에 의해 자동으로 스프링 빈이 등록되면 스프링은 오류 발생
    - ConflictingBeanDefinitionException 예외 발생
- 수동 빈 등록 vs 자동 빈 등록
  - 수동 빈 등록이 우선권을 가진다
    - 수동 빈이 자동 빈을 오버라이딩 해버린다
  - 하지만 대부분 이런 경우는 의도한 경우가 아니라 의도치 않은 경우가 많다
  - 하지만 오류가 발생하지 않으므로 대단히 찾기 어려운 오류가 된다
  - 그래서 스프링 부트에서는 최근에 이 경우도 오류를 발생하게 수정했다.
