# Section04\_스프링 빈과 의존관계

## 스프링빈과 의존관계 설정

## 스프링 빈이란?

### **스프링 빈 개념**

- **정의**: 스프링 IoC(Inversion of Control) 컨테이너에 의해 인스턴스화, 조립, 관리되는 객체.
- **목적**: 애플리케이션의 구성 요소(데이터 리포지토리, 서비스 레이어, 컨트롤러 등)를 중앙에서 관리하여 유연성 및 유지보수성 향상.

### **스프링 빈의 주요 특징**

- **의존성 주입(Dependency Injection)**
  - 목적: 객체 간의 결합도 감소, 의존성 관리 간소화.
  - 방법: 생성자, 세터, 필드 주입을 통한 의존성 주입.
- **싱글턴 스코프**
  - 기본 스코프: 스프링 빈은 기본적으로 싱글턴 스코프로 생성되어, 애플리케이션 내에 단 하나의 인스턴스만 존재.
  - 선택적 스코프: 프로토타입, 요청, 세션 등 다른 스코프를 명시적으로 지정할 수 있음.
- **생명주기 관리**
  - 초기화 및 소멸 콜백: 스프링 컨테이너는 빈의 생명주기 단계에 따라 콜백 메서드(**`@PostConstruct`**, **`@PreDestroy`**)를 호출하여 리소스 할당 및 해제 등을 관리.

### **스프링 빈의 등록 방법**

- **컴포넌트 스캔**
  - 작동 방식: 스프링이 **`@Component`** 및 해당 스테레오타입(**`@Repository`**, **`@Service`**, **`@Controller`**) 애노테이션이 붙은 클래스를 자동으로 찾아 스프링 빈으로 등록.
  - 사용 사례: 애플리케이션의 일반적인 구성 요소 자동 등록.
- **자바 설정 클래스 사용**

  - 작동 방식: **`@Configuration`** 클래스 내의 **`@Bean`** 애노테이션이 붙은 메서드를 통해 수동으로 빈을 정의하고 등록.
  - 사용 사례: 복잡한 빈 구성이 필요하거나, 외부 라이브러리를 빈으로 등록할 때 유용.

- 회원 컨트롤러가 회원서비스와 회원 리포지토리를 사용할 수 있어야 한다
  - 회원 컨트롤러가 각각에 대해 의존한다고 표현’
  - 자바 코드로 직접 스프링 빈 등록하기
  ![스프링 빈 등록 이미지](./images/스프링%20빈과%20의존관계.png)
  ```java
  package hello.hellospring.controller;

  import hello.hellospring.service.MemberService;
  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.stereotype.Controller;

  @Controller
  public class MemberController {

      private final MemberService memberService;

      @Autowired
      public MemberController(MemberService memberService) {
          this.memberService = memberService;
      }
  }
  ```
  - 스테레오 타입(@Componet) annotation (Controller, Repository, Service 같은)이 있으므로 스프링 빈으로 등록
  - 이후 생성자에서 Autowired annotation이 있으면 스프링이 연관된 객체를 스프링 컨테이너에서 찾아서 넣어준다
    - 연관된 객체도 스프링 빈으로 등록된 상태여야 한다.
  - DI(Dependency Injection) 의존성 주입 (컨트롤러 → 서비스 → 리포지토리)
    - 객체 의존관계를 외부에서 주입하는 것
- 스프링 빈을 등록하는 2가지 방법
  - 컴포넌트 스캔과 자동 의존관계 설정
  - 자바 코드로 직접 스프링 빈 등록
- 현재 방법은 @Componet 애노테이션이 있어서 컴포넌트 스캔으로 스프링 빈이 등록된 방법
  ```java
  @Service
  public class MemberService {

      private final MemberRepository memberRepository;

      @Autowired
      public MemberService(MemberRepository memberRepository) {
          this.memberRepository = memberRepository;
      }
  ```
  > 참고: 생성자가 1개만 있는 경우 @Autowired 생략가능

## 자바 코드로 직접 스프링 빈 등록하기

```java
package hello.hellospring;

import hello.hellospring.repository.MemberRepository;
import hello.hellospring.repository.MemoryMemberRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringConfig {

    @Bean
    public MemberService memberService() {
        return new MemberService(memberRepository());
    }

    @Bean
    public MemberRepository memberRepository() {
        return new MemoryMemberRepository();
    }
}
```

- hellospring 패키지에 SpringConfig 파일 생성
- @Configuration 애노테이션 사용
  - @Bean 사용해서 스프링 빈 등록
  - 리포지토리 등록해서 서비스에 DI
  - controller는 스프링에서 자동으로 관리하므로 이전과 같이 Controller 애노테이션과 Autowired 사용
- DI에는 세 가지 방법 존재
  - 필드 주입
  - setter 주입
  - 생성자 주입
    - 필드는 한 번 설정해두면 변경이 불가능해서 사용 x
    - setter는 불필요한 접근을 허용해서 사용 x
    - 의존관계가 실행 중에 동적으로 변하는 경우가 거의 없어서 생성자를 주로 사용
- 실무에선 주로 정형화된 컨트롤러, 서비스 , 리포지토리 같은 코드는 컴포넌트 스캔 사용
- 정형화 되지 않거나, 상황에 따라 구현 클래스를 변경해야 하면 스프링 빈으로 등록
- 현재 코드는 요구사항 정리에서 나온 것처럼 데이터베이스가 설정되면 리포지토리를 변경해야하는 상황이기 때문에 직접 스프링 빈으로 등록해서 사용
