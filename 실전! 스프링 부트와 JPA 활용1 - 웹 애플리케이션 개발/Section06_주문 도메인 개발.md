## 주문, 주문상품 엔티티 개발

**구현 기능**

- 상품 주문
- 주문 내역 조회
- 주문 취소

### 주문 엔티티

**주문 엔티티 코드**

```java
package jpabook.jpashop.domain;

@Entity
@Table(name = "orders")
@Getter @Setter
public class Order {

    @Id
    @GeneratedValue
    @Column(name = "order_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "delivery_id")
    private Delivery delivery;

    private LocalDateTime orderDate; // 주문시간

    @Enumerated(EnumType.STRING)
    private OrderStatus status; // 주문상태 [ORDER, CANCEL]

    //연관관계 메서드
    public void setMember(Member member) {
        this.member = member;
        member.getOrders().add(this);
    }

    public void addOrderItem(OrderItem orderItem) {
        orderItems.add(orderItem);
        orderItem.setOrder(this);
    }

    public void setDelivery(Delivery delivery) {
        this.delivery = delivery;
        delivery.setOrder(this);
    }

    // 생성 메서드
    public static Order createOrder(Member member, Delivery delivery, OrderItem... orderItems) {
        Order order = new Order();
        order.setMember(member);
        order.setDelivery(delivery);

        for (OrderItem orderItem : orderItems) {
            order.addOrderItem(orderItem);
        }
        order.setStatus(OrderStatus.ORDER);
        order.setOrderDate(LocalDateTime.now());
        return order;
    }

    // 비즈니스 로직
    public void cancel() {
        if (delivery.getStatuts() == DeliveryStatus.COMP) {
            throw new IllegalStateException("이미 배송완료된 상품은 취소가 불가능합니다.");
        }

        this.setStatus(OrderStatus.CANCEL);
        for (OrderItem orderItem : orderItems) {
            orderItem.cancel();
        }
    }

    // 조회 로직

    // 전체 주문 가격 조회
    public int getTotalPrice() {
        int totalPrice = 0;
        for (OrderItem orderItem : orderItems) {
            totalPrice += orderItem.getTotalPrice();
        }
        return totalPrice;
    }
}
```

- 생성 메서드(createOrder())
  - 주문 엔티티를 생성할 때 사용
    - 주문 회원, 배송정보, 주문상품의 정보를 받아서 주문 엔티티 생성
- 주문 취소(cancel())
  - 주문 취소시 사용
    - 주문 상태를 취소로 변경, 주문상품에 주문 취소를 알림
    - 이미 배송이 완료된 상품이면 주문을 취소하지 못하게 예외 발생
- 전체 주문 가격 조회
  - 주문 시 사용한 전체 주문 가격을 조회
  - 실무에서는 주로 주문에 주문 가격 필드를 두고 역정규화

### 주문상품 엔티티

**주문상태 엔티티 코드**

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

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name= "order_id")
    private Order order;

    private int orderPrice; // 주문 가격
    private int count; // 주문 수량

    // 생성 메서드
    public static OrderItem createOrderItem(Item item, int orderPrice, int count) {
        OrderItem orderItem = new OrderItem();
        orderItem.setItem(item);
        orderItem.setOrderPrice(orderPrice);
        orderItem.setCount(count);

        item.removeStock(count);
        return orderItem;
    }

    // 비즈니스 로직
    public void cancel() {
        getItem().addStock(count);
    }
    //  조회 로직
    public int getTotalPrice() {
        return getOrderPrice() * getCount();
    }
}

```

- 생성 메서드(createOrderItem())
  - 주문 상품, 가격, 수량 정보를 사용해서 주문상품 엔티티 생성
  - item.removeStock(count)를 호출해서 주문한 수량만큼 상품의 재고를 줄인다
- 주문 취소(cancel())
  - getItem().addStock(count)를 호출해서 취소한 주문 수량만큼 상품의 재고를 증가
- 주문 가격 조회(getTotalPrice())
  - 주문 가격에 수량을 곱한 값을 반환

## 주문 리포지토리 개발

**주문 리포지토리 코드**

```java
package jpabook.jpashop.repository;

@Repository
@RequiredArgsConstructor
public class OrderRepository {

    private final EntityManager em;

    public void save(Order order) {
        em.persist(order);
    }

    public Order findOne(Long id) {
        return em.find(Order.class, id);
    }

//    public List<Order> findAll(OrderSearch orderSearch) {}
}

```

- 주문 엔티티를 저장하고 검색하는 기능
  - findAll 메서드는 주문 검색 기능에서 자세하게 개발

## 주문 서비스 개발

**주문 서비스 코드**

```java
package jpabook.jpashop.service;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;
    private final ItemRepository itemRepository;
    //주문
    @Transactional
    public Long order(Long memberId, Long itemId, int count) {
        //엔티티 조회
        Member member = memberRepository.findOne(memberId);
        Item item = itemRepository.findOne(itemId);

        //배송정보 생성
        Delivery delivery = new Delivery();
        delivery.setAddress(member.getAddress());

        //주문상품 생성
        OrderItem orderItem = OrderItem.createOrderItem(item, item.getPrice(), count);

        //주문 생성
        Order order = Order.createOrder(member, delivery, orderItem);

        //주문 저장
        orderRepository.save(order);

        return order.getId();
    }

    //주문 취소
    @Transactional
    public void cancelOrder(Long orderId) {
        //주문 엔티티 조회
        Order order = orderRepository.findOne(orderId);
        //주문 취소
        order.cancel();
    }

    //검색
//    public List<Order> findOrders(OrderSearch orderSearch) {
//        return orderRepository.findAll(orderSearch);
//    }
}
```

- 주문 엔티티와 주문 상품 엔티티의 비즈니스 로직을 활용해서
  - 주문
  - 주문 취소
  - 주문 내역 검색 기능
- 예제를 단순화하기 위해서 한 번에 하나의 상품만 주문 가능
- 주문(order())
  - 주문하는 회원 식별자, 상품 식별자, 주문 수량 정보를 받아 주문 엔티티 생성 후 저장
- 주문 취소(cancelOrder())
  - 주문 식별자를 받아서 주문 엔티티를 조회한 후 주문 엔티티에 주문 취소를 요청
- 주문 검색(findOrders())
  - OrderSearch라는 검색 조건을 가진 객체로 주문 엔티티 검색

## 주문 기능 테스트

**상품 주문 테스트 코드**

```java
package jpabook.jpashop.service;

@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
public class OrderServiceTest {

    @Autowired
    EntityManager em;

    @Autowired
    OrderService orderService;

    @Autowired
    OrderRepository orderRepository;

    @Test
    public void 상품주문() throws Exception {
        //given
        Member member = createMember();

        Book book = createBook("시골 JPA", 10000, 10);

        int orderCount = 2;

        //when
        Long orderId = orderService.order(member.getId(), book.getId(), orderCount);

        //then
        Order getOrder = orderRepository.findOne(orderId);

        assertEquals("상품 주문시 상태는 ORDER", OrderStatus.ORDER, getOrder.getStatus());
        assertEquals("주문한 상품 종류 수가 정확해야 한다", 1, getOrder.getOrderItems().size());
        assertEquals("주문 가격은 가격 * 수량이다", 10000 * orderCount, getOrder.getTotalPrice());
        assertEquals("주문 수량만큼 재고가 줄어야 한다.", 8, book.getStockQuantity());
    }

    @Test(expected = NotEnougthStockException.class)
    public void 상품주문_재고수량초과() throws Exception {
        //given
        Member member = createMember();
        Item item = createBook("시골 JPA", 10000, 10);

        int orderCount = 11;

        //when
        orderService.order(member.getId(), item.getId(), orderCount);

        //then
        fail("재고 수량 부족 예외가 발행해야 한다.");
    }

    @Test
    public void 주문취소() throws Exception {
        //given
        Member member = createMember();
        Item item = createBook("시골 JPA", 10000, 10);

        int orderCount = 2;

        Long orderId = orderService.order(member.getId(), item.getId(), orderCount);

        //when
        orderService.cancelOrder(orderId);

        //then
        Order getOrder = orderRepository.findOne(orderId);

        assertEquals("주문 취소시 상태는 CANCEL 이다.", OrderStatus.CANCEL, getOrder.getStatus());
        assertEquals("주문이 취소된 상품은 그만큼 재고가 증가해야 한다.", 10, item.getStockQuantity());
    }

    private Book createBook(String name, int price, int stockQuantity) {
        Book book = new Book();
        book.setName(name);
        book.setPrice(price);
        book.setStockQuantity(stockQuantity);
        em.persist(book);
        return book;
    }

    private Member createMember() {
        Member member = new Member();
        member.setName("회원1");
        member.setAddress(new Address("서울", "강가", "123-123"));
        em.persist(member);
        return member;
    }
}
```

**테스트 요구사항**

- 상품 주문이 성공
  - Given
    - 테스트를 위한 회원과 상품을 생성
  - When
    - 실제 상품 주문
  - Then
    - 주문 가격이 올바른지, 재고 수량이 줄었는지 검증
- 상품을 주문할 때 재고 수량을 초과하면 안 된다
  - 재고가 10원인데 orderCount를 임의로 11로 설정해 에러가 제대로 발생
- 주문 취소가 성공
  - 주문 취소 후 주문 상태가 CANCEL인지, 취소한 만큼 재고가 증가했는지 검증

## 주문 검색 기능 개발

**검색 조건 파라미터 OrderSearch**

```java
package jpabook.jpashop.domain;

public class OrderSearch {

		private String memberName;      //회원 이름
		private OrderStatus orderStatus;//주문 상태[ORDER, CANCEL]

		//Getter, Setter
}
```

검색을 추가한 주문 리포지토리 코드

```java
package jpabook.jpashop.repository;

@Repository
public class OrderRepository {

    @PersistenceContext
		EntityManager em;

		public void save(Order order) {
		        em.persist(order);
		}

		public Order findOne(Long id) {
				return em.find(Order.class, id);
		}

		public List<Order> findAll(OrderSearch orderSearch) {
		//... 검색 로직
		}
}
```

- findAll 메서드는 검색 조건에 동적으로 쿼리를 생성해서 주문 엔티티를 조회
- JPQL로 처리하는 방법과 JPA Criteria로 처리하는 방법이 있지만 추천하지 않는다
  - Querydsl을 사용하자, 설명은 나중에
