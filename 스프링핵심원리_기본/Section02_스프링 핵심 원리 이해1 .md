# Section02\_스프링 핵심 원리 이해1

## 비즈니스 요구사항과 설계

- 회원
  - 가입하고 조회 가능
  - 일반과 VIP 등급 존재
  - 데이터는 자체 DB를 구축할 수 있고, 외부 시스템과 연동할 수 있다 (미확정)
- 주문과 할인 정책
  - 회원은 상품을 주문할 수 있다
  - 회원 등급에 따라 할인 정책을 적용할 수 있다
    - 할인 정책은 모든 VIP는 1000원을 할인해주는 고정 금액 할인을 적용 (나중에 변경 가능)
    - 변경 가능성이 높다. 회사의 기본 할인 정책을 아직 정하지 못했고, 오픈 직전까지 고민을 미뤄둘 예정
    - 최악의 경우 할인 정책을 적용 안 할 수도 있다.

→ 회원 데이터와 할인 정책은 지금 결정하기 어려운 부분이다

→ 인터페이스를 만들고 구현체를 언제든지 갈아끼울 수 있도록 설계

## 회원 도메인 설계

- 회원
  - 가입하고 조회 가능
  - 일반과 VIP 등급 존재
  - 데이터는 자체 DB를 구축할 수 있고, 외부 시스템과 연동할 수 있다 (미확정)

## 회원 도메인 개발

- 회원 엔티티
  - 회원 등급
  ```java
  package hello.core.member;

  public class Grade {
      BASIC,
      VIP
  }
  ```
  - 회원 엔티티
  ```java
  package hello.core.member;

  public class Member {
      private Long id;
      private String name;
      private Grade grade;

      public Member(Long id, String name, Grade grade) {
          this.id = id;
          this.name = name;
          this.grade = grade;
      }

      public Long getId() {
          return id;
      }

      public void setId(Long id) {
          this.id = id;
      }

      public String getName() {
          return name;
      }

      public void setName(String name) {
          this.name = name;
      }

      public Grade getGrade() {
          return grade;
      }

      public void setGrade(Grade grade) {
          this.grade = grade;
      }
  }
  ```
- 회원 저장소
  - 회원 저장소 인터페이스
  ```java
  package hello.core.member;

  public interface MemberRepository {

      void save(Member member);

      Member findById(Long memberId);
  }
  ```
  - 메모리 회원 저장소 구현체
  ```java
  package hello.core.member;

  import java.util.HashMap;
  import java.util.Map;

  public class MemoryMemberRepository implements MemberRepository {

      private static Map<Long, Member> store = new HashMap<>();
      @Override
      public void save(Member member) {
          store.put(member.getId(), member);
      }

      @Override
      public Member findById(Long memberId) {
          return store.get(memberId);
      }
  }
  ```
  - HaspMap은 동시성 이슈가 발생할 수 있다.
    - 실제로 개발할 때는 ConcurrentHashMap을 사용
- 회원 서비스
  - 회원 서비스 인터페이스
  ```java
  package hello.core.member;

  public interface MemberService {

      void join(Member member);

      Member findMember(Long memberId);
  }
  ```
  - 회원 서비스 구현체
  ```java
  package hello.core.member;

  public class MemberServiceImpl implements MemberService{

      private final MemberRepository memberRepository = new MemoryMemberRepository();
      @Override
      public void join(Member member) {
          memberRepository.save(member);
      }

      @Override
      public Member findMember(Long memberId) {
          return memberRepository.findById(memberId);
      }
  }
  ```
  - 관례적으로 구현체가 하나만 존재하면 클래스 이름에 Impl을 붙인다

## 회원 도메인 실행과 테스트

- 회원 도메인 - 회원 가입 main
  ```java
  package hello.core;

  import hello.core.member.Grade;
  import hello.core.member.Member;
  import hello.core.member.MemberService;
  import hello.core.member.MemberServiceImpl;

  public class MemberApp {

      public static void main(String[] args) {
          MemberServiceImpl memberService = new MemberServiceImpl();
          Member member = new Member(1L, "memberA", Grade.VIP);
          memberService.join(member);

          Member findMember = memberService.findMember(1L);
          System.out.println("new member = " + member.getName());
          System.out.println("find Member = " + findMember.getName());
      }
  }
  ```
  - 애플리케이션 로직으로 테스트하는 것은 좋은 방법이 아니다.
  - JUnit 테스트를 사용하자
- 회원 도메인 - 회원 가입 테스트
  ```java
  package hello.core.member;

  import org.assertj.core.api.Assertions;
  import org.junit.jupiter.api.Test;

  public class MemberServiceTest {

      MemberService memberService = new MemberServiceImpl();

      @Test
      void join() {
          //given
          Member member = new Member(1L, "memberA", Grade.VIP);

          //when
          memberService.join(member);
          Member findMember = memberService.findMember(1L);

          //then
          Assertions.assertThat(member).isEqualTo(findMember);
      }
  }
  ```
- 회원 도메인 설계의 문제점
  - 설계상 문제점이 무엇일까?
  - OCP 원칙을 잘 준수하고 있나?
  - DIP를 잘 지키고 있나?
    - 의존관계가 인터페이스 뿐만 아니라 구현까지 모두 의존하는 문제점이 있음

## 주문과 할인 도메인 설계

- 주문과 할인 정책
  - 회원은 상품을 주문할 수 있다
  - 회원 등급에 따라 할인 정책을 적용할 수 있다
    - 할인 정책은 모든 VIP는 1000원을 할인해주는 고정 금액 할인을 적용 (나중에 변경 가능)
    - 변경 가능성이 높다. 회사의 기본 할인 정책을 아직 정하지 못했고, 오픈 직전까지 고민을 미뤄둘 예정
    - 최악의 경우 할인 정책을 적용 안 할 수도 있다.
- 주문 도메인 협력, 역할, 책임

1. **주문 생성:** 클라이언트는 주문 서비스에 주문 생성을 요청한다
2. **회원 조회:** 할인을 위해서는 회원 등급이 필요하다. 그래서 주문 서비스는 회원 저장소에서 회원을 조회한다.
3. **할인 적용:** 주문 서비스는 회원 등급에 따른 할인 여부를 할인 정책에 위임한다.
4. **주문 결과 반환:** 주문 서비스는 할인 결과를 포함한 주문 결과를 반환한다.

> 🤦 실제로는 주문 데이터를 DB에 저장하겠지만 여기선 단순화해서 주문 결과를 반환

- 메모리에서 DB로, 정액에서 정률로 바꾸어도 주문 서비스를 변경하지 않아도 된다.

## 주문과 할인 도메인 개발

- 할인 정책 인터페이스
  ```java
  package hello.core.discount;

  import hello.core.member.Member;

  public interface DiscountPolicy {
      /*@return 할인 대상 금액*/
      int discount(Member member, int price);
  }
  ```
- 할인 정책 구현체
  ```java
  package hello.core.discount;

  import hello.core.member.Grade;
  import hello.core.member.Member;

  public class FixDiscountPolicy implements DiscountPolicy{

      private int discountFixAmount = 1000;
      @Override
      public int discount(Member member, int price) {
          if (member.getGrade() == Grade.VIP) {
              return discountFixAmount;
          } else {
              return 0;
          }
      }
  }
  ```
  - VIP면 1000원 할인, 아니면 할인 X
- 주문 엔티티
  ```java
  package hello.core.order;

  public class Order {

      private Long memberId;
      private String itemName;
      private int itemPrice;
      private int discountPrice;

      public Order(Long memberId, String itemName, int itemPrice, int discountPrice) {
          this.memberId = memberId;
          this.itemName = itemName;
          this.itemPrice = itemPrice;
          this.discountPrice = discountPrice;
      }

      public int calcutlatePrice() {
          return itemPrice - discountPrice;
      }
      public Long getMemberId() {
          return memberId;
      }

      public void setMemberId(Long memberId) {
          this.memberId = memberId;
      }

      public String getItemName() {
          return itemName;
      }

      public void setItemName(String itemName) {
          this.itemName = itemName;
      }

      public int getItemPrice() {
          return itemPrice;
      }

      public void setItemPrice(int itemPrice) {
          this.itemPrice = itemPrice;
      }

      public int getDiscountPrice() {
          return discountPrice;
      }

      public void setDiscountPrice(int discountPrice) {
          this.discountPrice = discountPrice;
      }

      @Override
      public String toString() {
          return "Order{" +
                  "memberId=" + memberId +
                  ", itemName='" + itemName + '\'' +
                  ", itemPrice=" + itemPrice +
                  ", discountPrice=" + discountPrice +
                  '}';
      }
  }
  ```
- 주문 서비스 인터페이스
  ```java
  package hello.core.order;

  public interface OrderService {
      Order createOrder(Long memberId, String itemName, int itemPrice);
  }
  ```
- 주문 서비스 구현체
  ```java
  package hello.core.order;

  import hello.core.discount.DiscountPolicy;
  import hello.core.discount.FixDiscountPolicy;
  import hello.core.member.Member;
  import hello.core.member.MemberRepository;
  import hello.core.member.MemoryMemberRepository;

  public class OrderServiceImpl implements OrderService {

      private final MemberRepository memberRepository = new MemoryMemberRepository();
      private final DiscountPolicy discountPolicy = new FixDiscountPolicy();
      @Override
      public Order createOrder(Long memberId, String itemName, int itemPrice) {
          Member member = memberRepository.findById(memberId);
          int discountPrice = discountPolicy.discount(member, itemPrice);

          return new Order(memberId, itemName, itemPrice, discountPrice);
      }
  }
  ```
  - 주문 생성 요청이 오면, 회원 정보를 조회하고, 할인 정책을 적용한 다음 주문 객체를 생성해서 반환
  - 메모리 회원 리포지토리와 고정 금액 할인 정책을 구현체로 생성

## 주문과 할인 도메인 실행과 테스트

- 주문과 할인 정책 실행
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
          MemberService memberService = new MemberServiceImpl();
          OrderService orderService = new OrderServiceImpl();

          Long memberId = 1L;
          Member member = new Member(memberId, "memberA", Grade.VIP);
          memberService.join(member);

          Order order = orderService.createOrder(memberId, "itemA", 10000);

          System.out.println("order = " + order);
          System.out.println("order.calculatePrice = " + order.calcutlatePrice());
      }
  }
  ```
- 하지만? JUnit 테스트를 이용해서 하는 것이 더 좋은 방법이다
