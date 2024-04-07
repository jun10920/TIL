## 상품 엔티티 개발(비즈니스 로직 추가)

**구현 기능**

- 상품 등록
- 상품 목록 조회
- 상품 수정

**수정**

- 상품 엔티티 개발(비즈니스 로직 추가)
- 상품 리포지토리 개발
- 상품 서비스 개발
- 상품 기능 테스트

### 상품 엔티티 개발(비즈니스 로직 추가)

**상품 엔티티 코드**

```java
package jpabook.jpashop.domain.item;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype")
@Getter
public abstract class Item {

    @Id
    @GeneratedValue
    @Column(name = "item_id")
    private Long id;

    private String name;
    private int price;
    private int stockQuantity;

    @ManyToMany(mappedBy = "items")
    private List<Category> categories = new ArrayList<>();

    // 비즈니스 로직

    // stock 증가
    public void addStock(int quantity) {
        this.stockQuantity += quantity;
    }

    // stock 감소
    public void removeStock(int quantity) {
        int restStock = this.stockQuantity - quantity;
        if (restStock < 0) {
            throw new NotEnougthStockException("need more stock");
        }
        this.stockQuantity = restStock;
    }
}
```

- 데이터를 가지고 있는 쪽에서 로직을 처리하는 것이 가장 낫다

**예외 추가**

```java
package jpabook.jpashop.exception;

public class NotEnougthStockException extends RuntimeException{

    public NotEnougthStockException() {
        super();
    }

    public NotEnougthStockException(String message) {
        super(message);
    }

    public NotEnougthStockException(String message, Throwable cause) {
        super(message, cause);
    }

    public NotEnougthStockException(Throwable cause) {
        super(cause);
    }

}
```

- **비즈니스 로직 분석**
  - addStock() 메서드는 파라미터로 넘어온 수만큼 재고를 늘린다.
    - 이 메서드는 재고가 증가하거나 상품 주문을 취소해서 재고를 다시 늘려야 할 때 사용한다.
  - removeStock() 메서드는 파라미터로 넘어온 수만큼 재고를 줄인다.
    - 만약 재고가 부족하면 예외가 발생
    - 상품을 주문할 때 사용한다.

## 상품 리포지토리 개발

**상품 리포지토리 코드**

```java
package jpabook.jpashop.repository;

@Repository
@RequiredArgsConstructor
public class ItemRepository {

    private final EntityManager em;

    public void save(Item item) {
        if (item.getId() == null) {
            em.persist(item);
        } else {
            em.merge(item);
        }
    }

    public Item findOne(Long id) {
        return em.find(Item.class, id);
    }

    public List<Item> findAll() {
        return em.createQuery("select i from Item i", Item.class)
                .getResultList();
    }
}
```

기능 설명

- save()
  - id가 없으면 신규로 보고 persist() 실행
  - id가 있으면 이미 데이터베이스에 저장된 엔티티를 수정한다고 보고 merge()를 실행

## 상품 서비스 개발

**상품 서비스 코드**

```java
package jpabook.jpashop.service;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    @Transactional
    public void saveItem(Item item) {
        itemRepository.save(item);
    }

    public List<Item> findItems() {
        return itemRepository.findAll();
    }

    public Item findOne(Long itemId) {
        return itemRepository.findOne(itemId);
    }
}
```

- 상품 서비스는 상품 리포지토리에 단순히 위임만 하는 클래스
