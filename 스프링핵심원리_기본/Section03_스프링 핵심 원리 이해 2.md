# Section03_스프링 핵심 원리 이해 2

## 새로운 할인 정책 개발

- 새로운 할인 정책을 확장해보자
- RateDiscountPolicy 추가
    
    ```java
    package hello.core.discount;
    
    import hello.core.member.Grade;
    import hello.core.member.Member;
    
    public class RateDiscountPolicy implements DiscountPolicy{
    
        private int dicountPercent = 10;
        @Override
        public int discount(Member member, int price) {
            if (member.getGrade() == Grade.VIP) {
                return price * dicountPercent / 100;
            } else {
                return 0;
            }
        }
    }
    ```
    
- 테스트 작성
    
    ```java
    package hello.core.discount;
    
    import hello.core.member.Grade;
    import hello.core.member.Member;
    import org.assertj.core.api.Assertions;
    import org.junit.jupiter.api.DisplayName;
    import org.junit.jupiter.api.Test;
    
    import static org.assertj.core.api.Assertions.*;
    import static org.junit.jupiter.api.Assertions.*;
    
    class RateDiscountPolicyTest {
        RateDiscountPolicy discountPolicy = new RateDiscountPolicy();
    
        @Test
        @DisplayName("VIP는 10% 할인이 적용되어야 한다")
        void vip_o() {
            //given
            Member member = new Member(1L, "memberVIP", Grade.VIP);
            //when
            int discount = discountPolicy.discount(member, 10000);
            //then
            assertThat(discount).isEqualTo(1000);
        }
        @Test
        @DisplayName("VIP는 아니면 할인이 적용되지 않아야 한다")
        void vip_x() {
            //given
            Member member = new Member(1L, "memberBASIC", Grade.BASIC);
            //when
            int discount = discountPolicy.discount(member, 10000);
            //then
            assertThat(discount).isEqualTo(1000);
        }
    }
    ```
    

## 새로운 할인 정책 적용과 문제

- 할인 정책을 애플리케이션에 적용해보자

```java
public class OrderServiceImpl implements OrderService {

    private final MemberRepository memberRepository = new MemoryMemberRepository();
//    private final DiscountPolicy discountPolicy = new FixDiscountPolicy();
    private final DiscountPolicy discountPolicy = new RateDiscountPolicy();
```

- 문제점 발견
    - 역할과 구현을 충실하게 분리했다 → O
    - 다형성도 활용하고, 인터페이스와 구현 객체를 분리했다 → O
    - OCP, DIP 같은 객체지향 설계 원칙을 충실해 준수했다 → X
        - DIP
            - 클래스 의존 관계를 분석하면 추상 뿐만 아니고 구체 클래스에도 의존
                - 추상 의존: DiscountPolicy
                - 구체 의존: FixDiscountPolicy, RateDiscountPolicy
        - OCP
            - 현 코드는 기능을 확장해서 변경하면 클라이언트 코드에 영향을 주므로 위반
    
- 인터페이스에만 의존하도록 설계를 변경
    
    ```java
    public class OrderServiceImpl implements OrderService {
    
        private final MemberRepository memberRepository = new MemoryMemberRepository();
        private DiscountPolicy discountPolicy;
    ```
    
    - 구현체가 없는데 어떻게 코드를 실행할 수 있을까?
        - 실제로 실행 해보면 NPE(Null Pointer Exception)이 발생
    - 해결방안
        - 누군가 구현 객체를 대신 생성하고 주입해야 한다.

## 관심사의 분리

- 애플리케이션을 하나의 공연, 인터페이스를 배역이라고 생각하자
    - 실제 배역에 맞는 배우를 누가 선택하는가?
    - 로미오와 줄리엣 공연에서 누가 로미오와 줄리엣을 할지 배우들이 정하는 것이 아니다.
    - 이 전 코드는 로미오 역할(인터페이스) 레오나르도 디카프리오(구현체)에게 줄리엣 역할(인터페이스)을 하는 여자 주인공(구현체)를 직접 초빙하는 것과 같다
- 관심사를 분리하자
    - 배우는 본인의 역할인 배역을 수행하는 것에만 집중하자
    - 공연을 구성하고, 담당 배우를 섭외하고, 역할에 맞는 배우를 지정하는 책임을 담당하는 **공연 기획자**가 있어야 한다.
- **AppConfig**
    - 애플리케이션의 전체 동작 방식을 구성(Config)하기 위해, 구현 객체를 생성하고, 연결하는 책임을 가지는 별도의 설정 클래스를 만들자
    
    ```java
    package hello.core;
    
    import hello.core.discount.FixDiscountPolicy;
    import hello.core.member.MemberService;
    import hello.core.member.MemberServiceImpl;
    import hello.core.member.MemoryMemberRepository;
    import hello.core.order.OrderService;
    import hello.core.order.OrderServiceImpl;
    
    public class AppConfig {
    
        public MemberService memberService() {
            return new MemberServiceImpl(new MemoryMemberRepository());
        }
    
        public OrderService orderService() {
            return new OrderServiceImpl(new MemoryMemberRepository(), new FixDiscountPolicy());
        }
    }
    ```
    
    - AppConfig는 애플리케이션의 실제 동작에 필요한 구현 객체를 생성한다
    - AppConfig는 생성한 객체 인스턴스의 참조(레퍼런스)를 생성자를 통해 주입(연결)해준다
- MemberServiceImpl 생성자 주입
    
    ```java
    public class MemberServiceImpl implements MemberService{
    
        private final MemberRepository memberRepository;
    
        public MemberServiceImpl(MemberRepository memberRepository) {
            this.memberRepository = memberRepository;
        }
    ```
    
    - 인터페이스에만 의존한다
    - 덕분에 생성자를 통해 어떤 객체가 주입될지는 알 수 없다
    - 어떤 구현 객체를 주입할지는 오직 외부(AppConfig)에서만 결정된다
    - MemberServiceImpl은 이제부터 의존관계에 대한 고민은 안하고 실행만 하면 된다
    
    - 객체의 생성과 연결은 AppConfig가 담당
    - DIP 완성: 이제 구체 클래스가 아닌 추상에만 의존하면 된다
    - 관심사의 분리: 객체를 생성하고 연결하는 역할과 실행하는 역할이 명확히 분리

    - appConfig는 memoryMemberRepository 객체를 생성하고 그 참조값을 memberServiceImpl을 생성하면서 생성자로 전달한다
    - 클라이언트인 memberServiceImpl 입장에서 보면 의존관계를 마치 외부에서 주입해주는 것 같다고 해서 DI(의존관계 주입, 의존성 주입)이라고 한다
- OrderServiceImpl - 생성자 주입
    
    ```java
    public class OrderServiceImpl implements OrderService {
    
        private final MemberRepository memberRepository;
        private final DiscountPolicy discountPolicy;
    
        public OrderServiceImpl(MemberRepository memberRepository, DiscountPolicy discountPolicy) {
            this.memberRepository = memberRepository;
            this.discountPolicy = discountPolicy;
        }
    ```
    
    - 위와 마찬가지
- AppConfig 실행
    - MemberApp
        
        ```java
        package hello.core;
        
        import hello.core.member.Grade;
        import hello.core.member.Member;
        import hello.core.member.MemberService;
        import hello.core.member.MemberServiceImpl;
        
        public class MemberApp {
        
            public static void main(String[] args) {
                AppConfig appConfig = new AppConfig();
                MemberService memberService = appConfig.memberService();
                Member member = new Member(1L, "memberA", Grade.VIP);
                memberService.join(member);
        
                Member findMember = memberService.findMember(1L);
                System.out.println("new member = " + member.getName());
                System.out.println("find Member = " + findMember.getName());
            }
        }
        ```
        
    - OrderApp
        
        ```java
        package hello.core;
        
        import hello.core.member.Grade;
        import hello.core.member.Member;
        import hello.core.member.MemberService;
        import hello.core.member.MemberServiceImpl;
        import hello.core.order.Order;
        import hello.core.order.OrderService;
        import hello.core.order.OrderServiceImpl;
        
        public class OrderApp {
        
            public static void main(String[] args) {
                AppConfig appConfig = new AppConfig();
                MemberService memberService = appConfig.memberService();
                OrderService orderService = appConfig.orderService();
        
                Long memberId = 1L;
                Member member = new Member(memberId, "memberA", Grade.VIP);
                memberService.join(member);
        
                Order order = orderService.createOrder(memberId, "itemA", 10000);
        
                System.out.println("order = " + order);
                System.out.println("order.calculatePrice = " + order.calcutlatePrice());
            }
        }
        ```
        
    - 테스트 코드
        
        ```java
        package hello.core.order;
        
        import hello.core.AppConfig;
        import hello.core.member.Grade;
        import hello.core.member.Member;
        import hello.core.member.MemberService;
        import org.assertj.core.api.Assertions;
        import org.junit.jupiter.api.BeforeEach;
        import org.junit.jupiter.api.Test;
        
        public class OrderServiceTest {
        
            MemberService memberService;
            OrderService orderService;
        
            @BeforeEach
            public void beforeEach() {
                AppConfig appConfig = new AppConfig();
                memberService = appConfig.memberService();
                orderService = appConfig.orderService();
            }
        
            @Test
            void createOrder() {
                Long memberId = 1L;
                Member member = new Member(memberId, "memberA", Grade.VIP);
                memberService.join(member);
        
                Order order = orderService.createOrder(memberId, "itemA", 10000);
                Assertions.assertThat(order.getDiscountPrice()).isEqualTo(1000);
        
            }
        }
        ```
        
        - BeforEach는 각 테스트를 실행하기 전에 호출

## AppConfig 리팩터링

- AppConfig 내에서 정확히 코드가 어떤 구조로 이루어져 있는 지 확인하면 좋다

- 중복을 제거하고 역할에 따른 구현이 보이도록 리팩터링 하자
    
    ```java
    package hello.core;
    
    import hello.core.discount.DiscountPolicy;
    import hello.core.discount.FixDiscountPolicy;
    import hello.core.member.MemberRepository;
    import hello.core.member.MemberService;
    import hello.core.member.MemberServiceImpl;
    import hello.core.member.MemoryMemberRepository;
    import hello.core.order.OrderService;
    import hello.core.order.OrderServiceImpl;
    
    public class AppConfig {
    
        public MemberService memberService() {
            return new MemberServiceImpl(memberRepository());
        }
    
        private MemberRepository memberRepository() {
            return new MemoryMemberRepository();
        }
    
        public OrderService orderService() {
            return new OrderServiceImpl(memberRepository(), discountPolicy());
        }
    
        private DiscountPolicy discountPolicy() {
            return new FixDiscountPolicy();
        }
    }
    ```
    
    - new MemoryMemberRepository() 이 부분이 중복 제거
    - AppConfig를 보면 역할과 구현 클래스가 한 눈에 들어온다.
        - 애플리케이션 전체 구성이 어떻게 되어있는지 빠르게 파악할 수 있다.

## 새로운 구조와 할인 정책 적용

- AppConfig의 등장으로 애플리케이션이 크게 사용 영역과, 객체를 생성하고 구성하는 영역으로 분리
    
    ```java
    private DiscountPolicy discountPolicy() {
    //        return new FixDiscountPolicy();
            return new RateDiscountPolicy();
        }
    ```
    
    - AppConfig에서 할인 정책 영역을 담당하는 구현을 변경하였다.
    - 변경하더라도 AppConfig만 수정하면 된다.
        - 클라이언트 코드인 OrderServiceImpl을 포함해서 사용 영역의 어떤 코드도 변경할 필요가 없다
    - 구성 영역은 당연히 변경해야 한다.
        - 기획자가 구현 객체들을 모두 알고 조정해야 하기 때문이다.

## 좋은 객체 지향 설계의 5가지 원칙의 적용

- SRP 단일 책임 원칙
    - 한 클래스는 하나의 책임만 가져야 한다
        - 클라이언트 객체는 직접 구현 객체를 생성하고, 연결하고, 실행하는 다양한 책임을 가지고 있음
        - SRP 단일 책임 원칙을 따르면서 관심사를 분리함
        - 구현 객체를 생성하고 연결하는 책임은 AppConfig가 담당
        - 클라이언트 객체를 실행하는 책임만 담당
- DIP 의존관계 역전 원칙
    - 프로그래머는 “추상화에 의존해야지, 구체화에 의존하면 안된다” 의존성 주입은 이 원칙을 따르는 방법 중 하나
        - 새로운 할인 정책을 개발하고 적용하려고 하니 클라이언트 코드도 함께 변경해야 함
            - 왜냐하면 기존 클라이언트 코드는 구체화 구현 클래스에도 함께 의존했기 때문
        - 클라이언트 코드가 DiscountPolicy 추상화 인터페이스에만 의존하도록 코드를 변경
        - 하지만 클라이언트 코드는 인터페이스만으로는 아무것도 실행 불가능
        - AppConfig가 FixDiscountPolicy 객체 인스턴스를 클라이언트 코드 대신 생성해서 클라이언트 코드에 의존관계를 주입
- OCP 개방 - 폐쇄 원칙
    - 소프트웨어 요소는 확장에는 열려 있으나 변경에는 닫혀 있어야 한다
        - 다형성 사용하고 클라이언트가 DIP를 지킴
        - 애플리케이션을 사용 영역과 구성 영역으로 나눔
        - AppConfig가 의존 관계를 변경하므로 클라이언트 코드는 변경하지 않아도 됨
        - 소프트웨어 요소를 새롭게 확장해도 사용 영역의 변경은 닫혀 있다.

## IoC, DI, 그리고 컨테이너

### 제어의 역전 IoC(Inversion of Control)

- 기존 프로그램은 클라이언트 구현 객체가 프로그램의 제어 흐름을 조종
    - 스스로 필요한 서버 구현 객체를 생성, 연결, 실행
- 반면에 AppConfig가 등장한 이후에 구현 객체는 자신의 로직을 실행하는 역할만 담당
    - 프로그램 제어 흐름은 AppConfig가 가져간다
- 프로그램의 제어 흐름을 직접 하는 것이 아니라 외부에서 관리하는 것을 제어의 역전이라고 한다.
- 프레임워크 VS 라이브러리
    - 프레임워크
        - 내가 작성한 코드를 제어하고, 대신 실행하면 프레임워크 (JUnit)
    - 라이브러리
        - 내가 작성한 코드가 직접 제어의 흐름을 담당한다면 라이브러리

### 의존관계 주입 DI(Dependency Injection)

- OrderServiceImpl은 DiscountPolicy 인터페이스에 의존한다. 실제 어떤 구현 객체가 사용될지는 모른다.
- 의존관계는 정적인 클래스 의존 관계와 실행 시점에 결정되는 동적인 객체(인스턴스) 의존 관계 둘을 분리해서 생각해야 한다.
- 정적인 클래스 의존관계
    - 정적인 의존 관계는 애플리케이션을 실행하지 않아도 분석할 수 있다.

    - 하지만 클래스 의존관계 만으로는 실제 어떤 객체가 OrderServiceImpl에 주입 될지 알 수 없다.
- 동적인 객체 인스턴스 의존 관계
    - 애플리케이션 실행 시점에 실제 생성된 객체 인스턴스의 참조가 연결된 의존 관계
        
    - 실행 시점(런타임)에 외부에서 실제 구현 객체를 생성하고 클라이언트에 전달해서 클라이언트와 서버의 실제 의존관계가 연결 되는 것을 **의존관계 주입이라 한다**
        - 객체 인스턴스를 생성하고 그 참조값을 전달해서 연결
        - 의존관계 주입을 사용하면
            - 클라이언트 코드를 변경하지 않고 클라이언트가 호출하는 대상의 타입 인스턴스를 변경할 수 있다.
            - 정적인 클래스 의존관계를 변경하지 않고, 동적인 객체 인스턴스 의존관계를 쉽게 변경할 수 있다.

### IoC 컨테이너, DI 컨테이너

- AppConfig 처럼 객체를 생성하고 관리하면서 의존관계를 연결해주는 것을 IoC 컨테이너 혹은 DI 컨테이너라 한다.
- 의존관계 주입에 초점을 맞추어 최근에는 주로 DI 컨테이너라 한다.
    - 또는 어셈블러, 오브젝트 팩토리라고 불린다.

## 스프링으로 전환하기

- AppConfig 스프링 기반으로 변경
    
    ```java
    package hello.core;
    
    @Configuration
    public class AppConfig {
        @Bean
        public MemberService memberService() {
            return new MemberServiceImpl(memberRepository());
        }
        @Bean
        public MemberRepository memberRepository() {
            return new MemoryMemberRepository();
        }
        @Bean
        public OrderService orderService() {
            return new OrderServiceImpl(memberRepository(), discountPolicy());
        }
        @Bean
        public DiscountPolicy discountPolicy() {
    //        return new FixDiscountPolicy();
            return new RateDiscountPolicy();
        }
    }
    ```
    
    - AppConfig에 설정을 구성한다는 뜻의 @Configuration을 붙여준다
    - 각 메서드에 @Bean을 붙여준다. 이렇게 하면 스프링 컨테이너에 스프링 빈으로 등록한다
- MemberApp에 스프링 컨테이너 적용
    
    ```java
    package hello.core;
    public class MemberApp {
    
        public static void main(String[] args) {
    //        AppConfig appConfig = new AppConfig();
    //        MemberService memberService = appConfig.memberService();
    
            ApplicationContext applicationContext = new AnnotationConfigApplicationContext(AppConfig.class);
            MemberService memberService = applicationContext.getBean("memberService", MemberService.class);
    
            Member member = new Member(1L, "memberA", Grade.VIP);
            memberService.join(member);
    
            Member findMember = memberService.findMember(1L);
            System.out.println("new member = " + member.getName());
            System.out.println("find Member = " + findMember.getName());
        }
    }
    ```
    
- OrderApp에 스프링 컨테이너 적용
    
    ```java
    package hello.core;
    
    public class OrderApp {
    
        public static void main(String[] args) {
    //        AppConfig appConfig = new AppConfig();
    //        MemberService memberService = appConfig.memberService();
    //        OrderService orderService = appConfig.orderService();
    
            ApplicationContext applicationContext = new AnnotationConfigApplicationContext(AppConfig.class);
    
            MemberService memberService = applicationContext.getBean("memberService", MemberService.class);
            OrderService orderService = applicationContext.getBean("orderService", OrderService.class);
    
            Long memberId = 1L;
            Member member = new Member(memberId, "memberA", Grade.VIP);
            memberService.join(member);
    
            Order order = orderService.createOrder(memberId, "itemA", 20000);
    
            System.out.println("order = " + order);
            System.out.println("order.calculatePrice = " + order.calcutlatePrice());
        }
    }
    ```
    
- 스프링 컨테이너
    - ApplicationContext를 스프링 컨테이너라고 한다
    - 기존에는 개발자가 AppConfig를 사용해서 직접 객체를 생성하고 DI를 했지만, 이제부터는 스프링 컨테이너를 통해서 사용한다
    - 스프링 컨테이너는 @Configuration이 붙은 AppConfig를 설정(구성) 정보로 사용한다
        - 여기서 @Bean이라 적힌 메서드를 모두 호출해서 반환된 객체를 스프링 컨테이너에 등록한다
            - 이렇게 등록된 객체를 스프링 빈이라 한다.
            - 스프링 빈은 @Bean이 붙은 메서드의 명을 스프링 빈의 이름으로 사용
            - 이전에는 개발자가 필요한 객체를 AppConfig를 사용해서 직접 조회했지만 이제부터는 스프링 컨테이너를 통해서 스프링 빈(객체)를 찾아야 한다.
                - 스프링 빈은 applicationContext.getBean() 메서드를 사용해서 찾을 수 있다.
    - 기존에는 직접 개발자가 자바코드로 모든 것을 했다면 이제부터는 스프링 컨테이너에 객체를 스프링 빈으로 등록하고, 스프링 빈을 찾아서 사용하도록 변경하였다.