## 요구사항 분석

- **회원 기능**
  - 회원 등록
  - 회원 조회
- **상품 기능**
  - 상품 등록
  - 상품 수정
  - 상품 조회
- **주문 가능**
  - 상품 주문
  - 주문 내역 조회
  - 주문 취소
- **기타 요구사항**
  - 상품은 재고 관리가 필요하다.
  - 상품의 종류는 도서, 음반, 영화가 있다.
  - 상품을 카테고리로 구분할 수 있다.
  - 상품 주문시 배송 정보를 입력할 수 있다.

## 도메인 모델과 테이블 설계

- 회원 - 주문 - 상품의 관계
  - 회원은 여러 상품을 주문 가능, 한 번 주문할 때 여러 상품을 선택 가능
    - 회원과 상품은 다대다 관계
      - **관계형 데이터베이스, 엔티티에선 다대다 관계를 사용 X**
      - 주문상품 엔티티를 통해 다대다 → 일대다, 다대일 관계로 만듬
- 상품 분류
  - 도서, 음반, 영화로 구분되므로 상품이라는 공통 속성을 사용하여 상속 구조로 표현

### 회원 엔티티 분석

- **회원(Member)**
  - 이름, Address(임베디드 타입), 주문(orders) 포함
- **주문(Order)**
  - 한 번 주문시 여러 상품을 주문 가능 → 주문상품(OrderItem)과 일대다 관계
  - 회원, 배송정보, 주문 날짜, 주문상태(status) 포함
    - 주문 상태는 열거형을 사용해 주문(ORDER)과 취소(CANCEL)을 표현 가능
- **주문상품(OrderItem)**
  - 주문한 상품 정보와 주문 금액(orderPrice), 주문 수량(count) 포함
    - 보통 OrderLine, LineItem으로 많이 표현
- **상품(Item)**
  - 이름, 가격, 재고수량(stockQuantity) 포함
  - 상품을 주문하면 재고수량이 감소
  - 상품의 종류로는 도서, 음반, 영화
- **배송(Delivery)**
  - 주문시 하나의 배송 정보를 생성
  - 주문과 배송은 일대일 관계
- **카테고리(Category)**
  - 상품과 다대다 관계
  - parent, child로 부모 자식 카테고리를 연결
- **주소(Address)**
  - 값 타입(임베디드 타입)
  - 회원과 배송(Delivery)에서 사용
- **참고사항**
  - 회원이 주문을 하기 때문에 회원이 주문리스트를 가지는 것이 잘 설계한 것 같다
    - 하지만 객체 세상은 현실과 다르게, 실무에서는 회원이 주문을 참조하지 않고 주문이 회원을 참조하는 것으로 충분하다
    - 여기서는 일대다-다대일 양방향 연관관계를 설명하기 위해 추가

### 회원 테이블 분석

- **MEMBER**
  - 회원 엔티티의 Address 임베디드 타입 정보가 회원 테이블에 그대로 들어감
    - DELIVERY 테이블도 마찬가지
- **ITEM**
  - 앨범, 도서, 영화 타입을 통합해서 하나의 테이블로 생성
    - DTYPE 컬럼으로 타입을 구분
- **참고사항**
  - 테이블 명이 ORDERS인 이유
    - ORDER BY가 관례어여서 ORDER 대신 ORDERS를 많이 사용
  - 실제 코드에서는 대문자 + _ 조합이나 소문자 + _ 을 많이 사용

### 연관관계 매핑 분석

- 회원 - 주문
  - 일대다, 다대일의 양방향 관계
  - 연관관계의 주인은 외래 키가 있는 주문이 하는 것이 좋다
    - Order.member → ORDERS.MEMBER_ID 외래 키와 매핑
- 주문상품과 주문
  - 다대일 양방향 관계
  - 주문상품이 연관관계의 주인(외래키가 있으므로)
    - OrderItem.order → ORDER_ITEM.ORDER_ID 외래 키와 매핑
- 주문상품과 상품
  - 다대일 단방향 관계
    - OrderItem.item → ORDER_ITEM.ITEM_ID 외래 키와 매핑
- 주문과 배송
  - 일대일 양방향 관계
    - Order.delivery → ORDERS.DELIVERY_ID 외래 키와 매핑
- 카테고리와 상품
  - @ManyToMany를 사용해서 매핑
    - 실무에서는 사용하지 않는 것을 추천

## 엔티티 클래스 개발

- 예제에서는 설명을 쉽게 하기 위해 엔티티 클래스에 Getter, Setter를 모두 열고 최대한 단순하게 설계
  - 실무에서는 가급적 Getter는 열어두고, Setter는 꼭 필요한 경우에만 사용하는 것을 추천
  - 참고
    - 이론적으로 Getter, Setter 모두 제공하지 않고, 꼭 필요한 별도의 메서드를 제공하는게 이상적
    - 하지만 실무에서 엔티티의 데이터는 조회할 일이 너무 많아서 Getter의 경우 열어두는 것이 편리
      - Getter를 호출하는 것은 로직이 변경하지 않는다.
      - 하지만 Setter는 데이터가 변경되므로 엔티티가 왜 변경되는지 추적하기 어려워진다.
      - 엔티티 변경 대신 Setter 대신에 변경 지점이 명확하도록 변경을 위한 비즈니스 메서드를 별도로 제공하는 것이 낫다
- **회원 엔티티**

  ```java
  package jpabook.jpashop.domain;

  @Entity
  @Getter @Setter
  public class Member {

      @Id @GeneratedValue
      @Column(name = "member_id")
      private Long id;

      private String name;

      @Embedded
      private Address address;

      @OneToMany(mappedBy = "member") // 주인에게 종속된 거울의 관게라는 의미
      private List<Order> orders = new ArrayList<>();
  }
  ```

  - 엔티티의 식별자는 id, PK 컬럼명은 member_idd 사용
    - 엔티티는 타입이 있으므로 id를 필드만으로 쉽게 구분 가능
    - 테이블은 타입이 없으므로 구분이 어렵다
      - 테이블은 관례상 테이블명 + id를 많이 사용
      - 객체에서도 id 대신 memberId 사용해도 좋다, 중요한 것은 일관성

- **주문 엔티티**

  ```java
  package jpabook.jpashop.domain;

  @Entity
  @Table(name = "orders")
  public class Order {

      @Id
      @GeneratedValue
      @Column(name = "order_id")
      private Long id;

      @ManyToOne
      @JoinColumn(name = "member_id")
      private Member member;

      @OneToMany(mappedBy = "order")
      private List<OrderItem> orderItem = new ArrayList<>();

      @OneToOne
      @JoinColumn(name = "delivery_id")
      private Delivery delivery;

      private LocalDateTime orderDate; // 주문시간

      @Enumerated(EnumType.STRING)
      private OrderStatus status; // 주문상태 [ORDER, CANCEL]
  }
  ```

- **주문 상태**

  ```java
  package jpabook.jpashop.domain;

  public enum OrderStatus {
      ORDER, CANCEL;
  }
  ```

- **주문상품 엔티티**

  ```java
  package jpabook.jpashop.domain;

  @Entity
  @Getter
  @Setter
  public class OrderItem {

      @Id
      @GeneratedValue
      @Column(name = "order_item_id")
      private Long id;

      @ManyToOne
      @JoinColumn(name = "item_id")
      private Item item;

      @ManyToOne
      @JoinColumn(name= "order_id")
      private Order order;

      private int orderPrice; // 주문 가격
      private int count; // 주문 수량
  }
  ```

- **상품 엔티티**

  ```java
  package jpabook.jpashop.domain.item;

  @Entity
  @Inheritance(strategy = InheritanceType.SINGLE_TABLE)
  @Getter @Setter
  public abstract class Item {

      @Id
      @GeneratedValue
      @Column(name = "item_id")
      private Long id;

      private String name;
      private int price;
      private int stockQuantity;

  }
  ```

- **상품 - 도서 엔티티**

  ```java
  package jpabook.jpashop.domain.item;

  @Entity
  @DiscriminatorValue("B")
  @Getter
  @Setter
  public class Book extends Item{

      private String author;
      private String isbn;
  }
  ```

- **상품 - 음반 엠티티**

  ```java
  package jpabook.jpashop.domain.item;

  @Entity
  @DiscriminatorValue("A")
  @DiscriminatorColumn(name = "dtype")
  @Getter @Setter
  public class Album extends Item{
      private String artist;
      private String etc;
  }

  ```

- **상품 - 영화 엔티티**

  ```java
  package jpabook.jpashop.domain.item;

  @Entity
  @DiscriminatorValue("M")
  @Getter @Setter
  public class Movie extends Item {

      private String director;
      private String actor;
  }

  ```

- **배송 엔티티**

  ```java
  package jpabook.jpashop.domain;

  @Entity
  @Getter @Setter
  public class Delivery {

      @Id
      @GeneratedValue
      @Column(name = "delivery_id")
      private Long id;

      @OneToOne(mappedBy = "delibery")
      private Order order;

      @Embedded
      private Address address;

      @Enumerated(EnumType.STRING)
      private DeliveryStatuts statuts; // READY, COMP
  }

  ```

- **배송 상태**

  ```java
  package jpabook.jpashop.domain;

  public enum DeliveryStatuts {
      READY, COMP
  }
  ```

- **카테고리 엔티티**

  ```java
  package jpabook.jpashop.domain;

  @Entity
  @Getter
  @Setter
  public class Category {

      @Id
      @GeneratedValue
      @Column(name = "category_id")
      private Long id;

      private String name;

      @ManyToMany
      @JoinTable(name = "category_item",
              joinColumns = @JoinColumn(name = "category_id"),
              inverseJoinColumns = @JoinColumn(name = "item_id"))
      private List<Item> items = new ArrayList();

      @ManyToOne
      @JoinColumn(name = "parent_id")
      private Category parent;

      @OneToMany(mappedBy = "parent")
      private List<Category> child = new ArrayList<>();
  }

  ```

  - 실무에서는 `@ManyToMany` 를 사용 X
    - 편리한 것 같지만 중간 테이블(`CATEGORY_ITEM`)에 컬럼을 추가할 수 없고 세밀하게 쿼리하기 어렵다
    - 중간 엔티티를 만들어서 다대다 → 일대다 + 다대일 매핑으로 풀어서 사용

- 주소 값 타입

  ```java
  package jpabook.jpashop.domain;

  @Embeddable
  @Getter
  public class Address {

      private String city;
      private String street;
      private String zipcode;

      protected Address() {
      }

      public Address(String city, String street, String zipcode) {
          this.city = city;
          this.street = street;
          this.zipcode = zipcode;
      }
  }
  ```

  - 값 타입들은 변경 불가능하게 설계
    - @Setter 제거, 생성자에서 값을 모두 초기화해서 변경 불가능하게 클래스 설계
    - JAP 스펙상 엔티티나 임베디드 타입(@Embeddable)은 자바 기본 생성자를 public 또는 protected로 설정해야 한다
      - JPA 구현 라이브러리가 객체를 생성할 때 리플렉션 같은 기술을 사용하도록 지원하기 위함

---

이렇게 엔티티들을 모두 설계 및 생성하고 바로 사용하는 것이 아니라, 이후에 보면서 정규화하면서 더 다듬어야 한다.

## 엔티티 설계시 주의점

### 엔티티에는 가급적 Setter 사용 금지

- Setter가 모두 열려있다
  - 변경 포인트가 너무 많아서 유지보수가 어렵다.
  - 나중에 리팩토링으로 Setter 제거

### 모든 연관관계는 지연로딩으로 설정

- 즉시로딩(EAGER)
  - 예측이 어렵고 어떤 SQL이 실행될지 추적하기 어렵다.
  - JPQL을 실행할 때 N + 1문제가 자주 발생
  - 실무에서 모든 연관관계는 지연로딩(LAZY)로 설정
  - 연관된 엔티티를 함께 DB에서 조회해야 하면, fetch join 또는 엔티티 그래프 기능 사용
  - @XToOne(OneToOne, ManyToOne) 관계는 기본이 즉시로딩이라 직접 지연로딩 설정

### 컬렉션은 필드에서 초기화 하자

- 컬렉션은 필드에서 바로 초기화 하는 것이 안전
- 하이버네이트는 엔티티를 영속화 할 때, 컬렉션을 감싸서 하이버네이트가 제공하는 내장 컬렉션으로 변경
- 만약 getOrders()처럼 임의의 메서드에서 컬렉션을 잘못 생성하면 하이버네이트 내부 메커니즘에 문자가 발생
  - 따라서 필드레벨에서 생성하는 것이 가장 안전하고 코드도 간결

```java
Member member = new Member();
System.out.println(member.getOrders().getClass());
em.persist(member);
System.out.println(member.getOrders().getClass());

//출력 결과
class java.util.ArrayList
class org.hibernate.collection.internal.PersistentBag
```

### 테이블, 컬럼명 생성 전략

- 스프링 부트에서 하이버네이트 기본 매핑 전략을 변경해서 실제 테이블 필드명은 다름
- 하이버네이트 기존 구현
  - 엔티티의 필드명을 그대로 테이블의 컬럼명으로 사용
- 스프링 부트 신규 설정(엔티티(필드) → 테이블(컬럼))
  1. 카멜 케이스 → 언더 스코어
  2. .(점) → 언더스코어
  3. 대문자 → 소문자
- 적용 2단계
  1. 논리명 생성
     1. 명시적으로 컬럼, 테이블명을 직접 적지 않으면 ImplicitNamingSstrategy 사용
  2. 물리명 적용
     1. 모든 논리명에 적용됨, 실제 테이블에 적용
