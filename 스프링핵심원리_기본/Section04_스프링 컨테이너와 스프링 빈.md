# Section04\_스프링 컨테이너와 스프링 빈

## 스프링 컨테이너 생성

```java
ApplicationContext applicationContext = new AnnotationConfigApplicationContext(AppConfig.class);
```

- ApplicationContext를 스프링 컨테이너라고 한다.
  - 인터페이스이다
- 스프링 컨테이너는 XML 기반과 애노테이션 기반의 자바 설정 클래스로 만들 수 있다.
  - 직전에 AppConfig를 사용했던 방식이 애노테이션 기반의 자바 설정 클래스로 스프링 컨테이너를 만든 것
- new AnnotationConfigApplicationContext(ApConfig.class);
  - 이 클래스는 AplicationContext 인터페이스의 구현체

<aside>
⚠️ 스프링 컨테이너를 부를 때 BeanFactory와 ApplicationContext를 구분해야 한다
하지만 대부분의 경우 ApplicationContext를 사용하므로 이를 스프링 컨테이너로 생각

</aside>

### 스프링 컨테이너의 생성 과정

1. 스프링 컨테이너 생성

   - 스프링 컨테이너를 생성할 때는 구성 정보를 지정
     - 여기서는 AppConfig.class를 구성 정보를 사용

2. 스프링 빈 등록
   - 스프링 컨테이너는 파라미터로 넘어온 설정 클래스 정보를 사용해서 스프링 빈으로 등록
   - 빈 이름
     - 메서드 이름을 사용
     - 직접 부여할 수도 있다.
       - @Bean(name=’memberService2’)

> **빈 이름은 항상 다른 이름을 부여해야 한다.**
> 같은 이름을 부여하면 다른 빈이 무시되거나, 기존 빈을 덮어버리거나, 설정에 따라 오류가 발생한다.

1. 스프링 빈 의존관계 설정 - 준비

2. 스프링 빈 의존관계 설정 - 완료

   - 스프링 컨테이너는 설정 정보를 참고해서 DI한다
   - 단순히 자바 코드를 호출하는 것 같지만 차이가 존재
     - 차이는 뒤에 싱글톤 컨테이너에서 설명

   > 스프링은 빈을 생성하고, 의존관계를 주입하는 단계가 나누어져 있다.
   > 자바 코드로 스프링 빈을 등록하면 생성자를 호출하면서 DI도 동시에 처리된다. 자세한 내용은 의존관계 자동 주입에서 다시 설명

## 컨테이너에 등록된 모든 빈 조회

```java
package hello.core.beanfind;

import hello.core.AppConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;

class ApplicationContextInfoTest {

    AnnotationConfigApplicationContext ac = new AnnotationConfigApplicationContext(AppConfig.class);

    @Test
    @DisplayName("모든 빈 출력하기")
    void findAllBean() {
        String[] beanDefinitionNames = ac.getBeanDefinitionNames();
        for (String beanDefinitionName : beanDefinitionNames) {
            Object bean = ac.getBean(beanDefinitionName);
            System.out.println("name = " + beanDefinitionName + " object = " + bean);
        }
    }
    @Test
    @DisplayName("애플리케이션 빈 출력하기")
    void findApplicationBean() {
        String[] beanDefinitionNames = ac.getBeanDefinitionNames();
        for (String beanDefinitionName : beanDefinitionNames) {
            BeanDefinition beanDefinition = ac.getBeanDefinition(beanDefinitionName);

            //Role ROLE_APPLICATION: 직접 등록한 애플리케이션 빈
            //Role ROLE_INFRASTRUCTURE: 스프링이 내부에서 사용하는 빈
            if (beanDefinition.getRole() == BeanDefinition.ROLE_APPLICATION) {
                Object bean = ac.getBean(beanDefinitionName);
                System.out.println("name = " + beanDefinitionName + ", object = " + bean);
            }
        }
    }
}
```

- 모든 빈 출력하기
  - 실행하면 스프링에 등록된 모든 빈 정보를 출력 가능
    - ac.getBeanDefinitionNames(): 스프링에 등록된 모든 빈 이름을 조회
    - ac.getBean(): 빈 이름으로 빈 객체(인스턴스)를 조회
- 애플리케이션 빈 출력하기
  - 스프링이 내부에서 사용하는 빈은 제외하고 내가 등록한 빈만 출력하기
    - getBeanDefinition(): 스프링에 등록된 빈의 타입을 이름으로 조회
    - 스프링이 내부에서 사용하는 빈은 getRole() 로 구분 가능
      - Role ROLE_APPLICATION: 직접 등록한 애플리케이션
      - Role ROLE_INFRASTRUCTURE: 스프링이 내부에서 사용하는 빈

## 스프링 빈 조회 - 기본

- 스프링 컨테이너에서 스프링 빈을 찾는 가장 기본적인 조회 방법

  - ac.getBean(빈이름, 타입)
  - ac.getBean(타입)
  - 조회 대상 스프링 빈이 없으면 예외 발생

  ```java
  package hello.core.beanfind;

  import hello.core.AppConfig;
  import hello.core.member.MemberService;
  import hello.core.member.MemberServiceImpl;
  import org.assertj.core.api.Assertions;
  import org.junit.jupiter.api.DisplayName;
  import org.junit.jupiter.api.Test;
  import org.springframework.beans.factory.NoSuchBeanDefinitionException;
  import org.springframework.context.annotation.AnnotationConfigApplicationContext;

  import static org.assertj.core.api.Assertions.*;
  import static org.junit.jupiter.api.Assertions.assertThrows;

  class ApplicationContextBasicFindTest {

      AnnotationConfigApplicationContext ac = new AnnotationConfigApplicationContext(AppConfig.class);

      @Test
      @DisplayName("빈 이름으로 조회")
      void findBeanByName() {
          MemberService memberService = ac.getBean("memberService", MemberService.class);
          assertThat(memberService).isInstanceOf(MemberServiceImpl.class);
      }

      @Test
      @DisplayName("이름 없이 타입으로만 조회")
      void findBeanByType() {
          MemberService memberService = ac.getBean(MemberService.class);
          assertThat(memberService).isInstanceOf(MemberServiceImpl.class);
      }

      // 추상에 의존하는 게 좋으므로 좋은 코드는 아니다
      @Test
      @DisplayName("구체 타입으로 조회")
      void findBeanByName2() {
          MemberService memberService = ac.getBean("memberService", MemberServiceImpl.class);
          assertThat(memberService).isInstanceOf(MemberServiceImpl.class);
      }

      @Test
      @DisplayName("빈 이름으로 조회X")
      void findBeanByNameX() {
          assertThrows(NoSuchBeanDefinitionException.class,
                  () -> ac.getBean("xxxxx", MemberService.class));
      }

  }
  ```

## 스프링 빈 조회 - 동일한 타입이 둘 이상

- 타입으로 조회시 같은 타입의 스프링 빈이 둘 이상이면 오류 발생
  - 이때는 빈 이름을 지정
- ac.getBeansOfType()을 사용하면 해당 타입의 모든 빈을 조회 가능

  ```java
  package hello.core.beanfind;

  import hello.core.AppConfig;
  import hello.core.member.MemberRepository;
  import hello.core.member.MemoryMemberRepository;
  import org.junit.jupiter.api.DisplayName;
  import org.junit.jupiter.api.Test;
  import org.springframework.beans.factory.NoUniqueBeanDefinitionException;
  import org.springframework.context.annotation.AnnotationConfigApplicationContext;
  import org.springframework.context.annotation.Bean;
  import org.springframework.context.annotation.Configuration;

  import java.util.Map;

  import static org.assertj.core.api.Assertions.assertThat;
  import static org.junit.jupiter.api.Assertions.assertThrows;

  public class ApplicationContextSameBeanFindText {

      AnnotationConfigApplicationContext ac = new AnnotationConfigApplicationContext(SameBeanConfig.class);

      @Test
      @DisplayName("타입으로 조회시 같은 타입이 둘 이상 있으면, 중복 오류가 발생한다")
      void fingBeanByTypeDuplicate() {
          assertThrows(NoUniqueBeanDefinitionException.class,
                  () -> ac.getBean(MemberRepository.class));
      }

      @Test
      @DisplayName("타입으로 조회시 같은 타입이 둘 이상 있으면, 빈 이름을 지정하면 된다")
      void findByName() {
          MemberRepository memberRepository = ac.getBean("memberRepository1", MemberRepository.class);
          assertThat(memberRepository).isInstanceOf(MemberRepository.class);
      }

      @Test
      @DisplayName("특정 타입을 모두 조회하기")
      void findAllBeanByType() {
          Map<String, MemberRepository> beansOfType = ac.getBeansOfType(MemberRepository.class);
          for (String key : beansOfType.keySet()) {
              System.out.println("key = " + key + ", value = " + beansOfType.get(key));
          }
          System.out.println("beansOfType = " + beansOfType);
          assertThat(beansOfType.size()).isEqualTo(2);
      }

  // static class를 public class 안에 생성한다는 의미는 범위가
  // 여기 안에서만 작동하는 class라는 의미다
      @Configuration
      static class SameBeanConfig {
          @Bean
          public MemberRepository memberRepository1() {
              return new MemoryMemberRepository();
          }

          @Bean
          public MemberRepository memberRepository2() {
              return new MemoryMemberRepository();
          }
      }
  }
  ```

- 테스트를 위해서 이 파일에서만 사용하는 Config 파일 생성
  - 이 Config 파일에는 같은 타입의 인터페이스를 반환하는 빈이 존재

## 스프링 빈 조회 - 상속 관계

- 부모 타입으로 조회하면 자식 타입도 함께 조회

  - 그래서 모든 자바 객체의 부모인 Object 타입으로 조회하면 모든 스프링 빈을 조회

    ```java
    package hello.core.beanfind;

    import hello.core.AppConfig;
    import hello.core.discount.DiscountPolicy;
    import hello.core.discount.FixDiscountPolicy;
    import hello.core.discount.RateDiscountPolicy;
    import hello.core.member.MemberRepository;
    import hello.core.member.MemoryMemberRepository;
    import org.junit.jupiter.api.DisplayName;
    import org.junit.jupiter.api.Test;
    import org.springframework.beans.factory.NoUniqueBeanDefinitionException;
    import org.springframework.context.annotation.AnnotationConfigApplicationContext;
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;

    import java.util.Map;
    import java.util.Optional;

    import static org.assertj.core.api.Assertions.assertThat;
    import static org.junit.jupiter.api.Assertions.assertThrows;

    public class ApplicationContextExtendsFindTest {

        AnnotationConfigApplicationContext ac = new AnnotationConfigApplicationContext(TestConfig.class);

        @Test
        @DisplayName("부모 타입으로 조회시, 자식이 둘 이상 있으면 중복 오류가 발생한다")
        void findByParentTypeDuplicate() {
            assertThrows(NoUniqueBeanDefinitionException.class,
                    () -> ac.getBean(DiscountPolicy.class));
        }
        @Test
        @DisplayName("부모 타입으로 조회시, 자식이 둘 이상 있으면 빈 이름을 지정하면 된다")
        void findByParentTypeBeanName() {
            DiscountPolicy rateDiscountPolicy = ac.getBean("rateDiscountPolicy", DiscountPolicy.class);
            assertThat(rateDiscountPolicy).isInstanceOf(RateDiscountPolicy.class);
        }
        @Test
        @DisplayName("특정 하위 타입으로 조회")
        void findBeanBySubType() {
            RateDiscountPolicy bean = ac.getBean(RateDiscountPolicy.class);
            assertThat(bean).isInstanceOf(RateDiscountPolicy.class);
        }

        @Test
        @DisplayName("부모 타입으로 모두 조회하기")
        void findAllBeanByParentType() {
            Map<String, DiscountPolicy> beansOfType = ac.getBeansOfType(DiscountPolicy.class);
            assertThat(beansOfType.size()).isEqualTo(2);
            for (String key : beansOfType.keySet()) {
                System.out.println("key = " + key + " value = " + beansOfType.get(key));
            }
        }
        @Test
        @DisplayName("부모 타입으로 모두 조회하기 - Object")
        void findAllBeanByObjectType() {
            Map<String, Object> beansOfType = ac.getBeansOfType(Object.class);
            for (String key : beansOfType.keySet()) {
                System.out.println("key = " + key + " value = " + beansOfType.get(key));
            }
        }

        @Configuration
        static class TestConfig {
            @Bean
            public DiscountPolicy rateDiscountPolicy() {
                return new RateDiscountPolicy();
            }

            @Bean
            public DiscountPolicy fixDiscountPolicy() {
                return new FixDiscountPolicy();
            }
        }
    }
    ```

  - 실제로는 스프링 컨테이너를 생성해서 빈을 조회하는 경우는 거의 없다
  - 하지만 순수 자바 프로덕트에서 이를 사용하는 경우도 있고, 상속 관계도 알아볼 겸 학습

## BeanFactory와 ApplicationContext

- BeanFactory
  - 스프링 컨테이너의 최상위 인터페이스
  - 스프링 빈을 관리하고 조회하는 역할을 담당
  - getBean()을 제공
- ApplicationContext
  - BeanFactory 기능을 모두 상속받아서 제공
  - 애플리케이션을 개발할 때 필요한 수많은 부가기능 제공

### ApplicationContext의 부가기능

- 메시지 소스를 활용한 국제화 기능
  - 예를 들어서 한국에서 들어오면 한국어로, 영어권에서 들어오면 영어로 출력
- 환경변수
  - 로컬, 개발 ,운영 환경 등을 구분해서 처리
- 애플리케이션 이벤트
  - 이벤트를 발행하고, 구독하는 모델을 편리하게 지원
- 편리한 리소스 조회
  - 파일, 클래스패스, 외부 등에서 리소스를 편리하게 조회

### 정리

- BeanFactory를 직접 사용할 일을 거의 없고 부가기능이 포함된 ApplicationContext를 주로 사용
- 하지만 둘 다 스프링 컨테이너라고 부른다

## 다양한 설정 형식 지원 - 자바 코드, XML

- 스프링 컨테이너는 다양한 형식의 설정 정보를 받아들일 수 있게 유연하게 설계되어 있다
  - 자바 코드, XML, Groovy 등등
- XML 설정 사용

  - 최근에는 스프링 부트를 많이 사용하면서 XML 기반의 설정은 거의 사용 X
  - GenericXmlApplicationContext를 사용해서 xml 설정 파일을 넘기면 된다.
  - XmlAppConfig 사용 자바 코드

    ```java
    package hello.core.xml;

    import hello.core.MemberApp;
    import hello.core.member.MemberService;
    import org.assertj.core.api.Assertions;
    import org.junit.jupiter.api.Test;
    import org.springframework.context.ApplicationContext;
    import org.springframework.context.support.GenericXmlApplicationContext;

    import static org.assertj.core.api.Assertions.*;

    public class XmlAppContext {

        @Test
        void xmlAppContext() {
            ApplicationContext ac = new GenericXmlApplicationContext("appConfig.xml");
            MemberService memberService = ac.getBean("memberService", MemberService.class);
            assertThat(memberService).isInstanceOf(MemberService.class);
        }
    }
    ```

  - xml 기반의 스프링 빈 설정 정보

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

        <bean id="memberService" class="hello.core.member.MemberServiceImpl">
            <constructor-arg name="memberRepository" ref="memberRepository"/>
        </bean>
        <bean id="memberRepository" class="hello.core.member.MemoryMemberRepository"/>

        <bean id="orderService" class="hello.core.order.OrderServiceImpl">
            <constructor-arg name="memberRepository" ref="memberRepository"/>
            <constructor-arg name="discountPolicy" ref="discountPolicy"/>
        </bean>

        <bean id="discountPolicy" class="hello.core.discount.RateDiscountPolicy"/>
    </beans>
    ```

## 스프링 빈 설정 메타 정보 - BeanDefinition

- 스프링은 BeanDefinition이라는 추상화를 통해서 다양한 설정 형식을 지원한다
- 쉽게 말해서 역할과 구현을 개념적으로 나눈 것이다
  - XML을 읽어서 BeanDefinition으로 추상화
  - 자바 코드를 읽어서 BeanDefinition으로 추상화
  - 스프링 컨테이너는 인터페이스인 BeanDefinition에만 의존
- BeanDefinition을 빈 설정 메타 정보라고 한다
  - @Bean, <bean>당 각각 하나씩 메타 정보를 생성
- 스프링 컨테이너는 이 메타정보를 기반으로 스프링 빈을 생성

  - 각각의 스프링 컨테이너는 각 컨테이너에 있는 Reader를 사용해서 Config 파일을 읽고 BeanDefinition을 생성한다
  - 새로운 형식의 설정 정보가 추가되면 거기에 맞는 Reader를 만들어서 BeanDefinition을 생성하면 된다

- BeanDefinition 살펴보기
- BeanDefinition 정보

  - BeanClassName: 생성할 빈의 클래스 명(자바 설정 처럼 팩토리 역할의 빈을 사용하면 없음)
  - factoryBeanName: 팩토리 역할의 빈을 사용할 경우 이름, 예) appConfig
  - factoryMethodName: 빈을 생성할 팩토리 메서드 지정, 예) memberService
  - Scope: 싱글톤(기본값)
  - lazyInit: 스프링 컨테이너를 생성할 때 빈을 생성하는 것이 아니라, 실제 빈을 사용할 때 까지 최대한 생성을 지연처리 하는지 여부
  - InitMethodName: 빈을 생성하고, 의존관계를 적용한 뒤에 호출되는 초기화 메서드 명
  - DestroyMethodName: 빈의 생명주기가 끝나서 제거하기 직전에 호출되는 메서드 명
  - Constructor arguments, Properties: 의존관계 주입에서 사용한다. (자바 설정 처럼 팩토리 역할의 빈을 사용하면 없음)
  - 코드

    ```java
    package hello.core.beandefinition;

    import hello.core.AppConfig;
    import org.junit.jupiter.api.DisplayName;
    import org.junit.jupiter.api.Test;
    import org.springframework.beans.factory.config.BeanDefinition;
    import org.springframework.context.annotation.AnnotationConfigApplicationContext;

    public class BeanDefinitionTest {

        AnnotationConfigApplicationContext ac = new AnnotationConfigApplicationContext(AppConfig.class);

        @Test
        @DisplayName("빈 설정 메타정보 확인")
        void findApplicationBean() {
            String[] beanDefinitionNames = ac.getBeanDefinitionNames();
            for (String beanDefinitionName : beanDefinitionNames) {
                BeanDefinition beanDefinition = ac.getBeanDefinition(beanDefinitionName);

                if (beanDefinition.getRole() == BeanDefinition.ROLE_APPLICATION) {
                    System.out.println("beanDefinitionName = " + beanDefinitionName +
                            " beanDefinition = "+ beanDefinition);
                }
            }
        }
    }
    ```

### 정리

- BeanDefinition을 직접 생성해서 스프링 컨테이너에 등록할 수도 있다
  - 컨테이너와 리더를 직접 정의
  - 하지만 실무에서 이를 직접 정의하거나 사용할 일은 거의 없다
- 스프링이 다양한 형태의 설정 정보를 추상화해서 사용한다는 것 정도만 이해하면 된다
  - 가끔 스프링 코드나 스프링 관련 오픈 소스 코드를 볼 때 이를 참고
- spring에서 사용하는 annotation 방식은 factory 방식을 이용하는 것
