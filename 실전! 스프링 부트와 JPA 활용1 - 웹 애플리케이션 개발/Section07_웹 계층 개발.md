## 홈 화면과 레이아웃

**홈 컨트롤러 등록**

```java
package jpabook.jpashop.controller;

@Controller
@Slf4j
public class HomeController {

    @RequestMapping("/")
    public String home() {
        log.info("home controller");
        return "home";
    }
}
```

- html과 타임리프 관련해서는 그냥 복붙했기 때문에 따로 기록하지 않겠다.

## 회원 등록

- 폼 객체를 사용해서 화면 계층과 서비스 계층을 명확하게 분리

**회원 등록 폼 객체**

```java
package jpabook.jpashop.controller;

@Getter
@Setter
public class MemberForm {

    @NotEmpty(message = "회원 이름은 필수 입니다.")
    private String name;

    private String city;
    private String street;
    private String zipcode;
}
```

- 정말 간단한 form인 경우는 그냥 member 객체를 사용해서 데이터를 바인딩 해도 되지만 실무에선 거의 그런 경우가 없으므로 form 객체를 따로 만들어서 사용하는 것을 추천

**회원 등록 컨트롤러**

```java
package jpabook.jpashop.controller;

@Controller
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/members/new")
    public String createForm(Model model) {
        model.addAttribute("memberForm", new MemberForm());
        return "members/createMemberForm";
    }

    @PostMapping("/members/new")
    public String create(@Valid MemberForm form, BindingResult result) {

        if (result.hasErrors()) {
            return "members/createMemberForm";
        }

        Address address = new Address(form.getCity(), form.getStreet(), form.getZipcode());

        Member member = new Member();
        member.setName(form.getName());
        member.setAddress(address);

        memberService.join(member);
        return "redirect:/";
    }
}
```

**회원 등록 폼 화면 html 일부**

```java
<style>
    .fieldError {
        border-color: #bd2130;
    }
</style>
        <div class="form-group">
            <label th:for="name">이름</label>
            <input type="text" th:field="*{name}" class="form-control"
                   placeholder="이름을 입력하세요"
                   th:class="${#fields.hasErrors('name')}? 'form-controlfieldError' : 'form-control'">
            <p th:if="${#fields.hasErrors('name')}" th:errors="*{name}">Incorrect date</p>
       </div>
```

- @Valid 애노테이션을 통해서 검증
  - BindingResult로 들어온 결과에 오류가 발생
  - 아래에 있는 경로로 다시 전송
  - 타임리프 기법에 의해 html 일부를 에러화면으로 동적으로 변경

## 회원 목록 조회

**회원 목록 컨트롤러 추가**

```java
    @GetMapping("/members")
    public String list(Model model) {
        List<Member> members = memberService.findMembers();
        model.addAttribute("members", members);
        return "members/memberList";
    }
```

- 조회한 상품을 뷰에 전달하기 위해 스프링MVC가 제공하는 모델(Model) 객체에 보관
- 실행할 뷰 이름을 반환

참고

- 타임리프에서 ?를 사용하면 null로 넘어온 값을 무시한다.
- 폼 객체 vs 엔티티 직접 사용
  - 실무에서는 엔티티는 핵심 비즈니스 로직만 가지고 있고 화면을 위한 로직은 없어야 한다.
  - API를 만들 때는 절대 외부로 엔티티를 넘기면 안된다.
    - 화면이나 API에 맞는 폼 객체나 DTO를 사용해야 한다.
  - JPA를 이용할 때 엔티티를 최대한 종속적이지 않게 설계하는 것이 중요하다.

## 상품 등록

**상품 등록 폼**

```java
package jpabook.jpashop.controller;

@Getter @Setter
public class BookForm {

    private Long id;

    private String name;
    private int price;
    private int stockQuantity;

    private String author;
    private String isbn;
}
```

**상품 등록 컨트롤러**

```java
package jpabook.jpashop.controller;

@Controller
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @GetMapping("/items/new")
    public String createForm(Model model) {
        model.addAttribute("form", new BookForm());
        return "items/createItemForm";
    }

    @PostMapping("items/new")
    public String create(BookForm form) {
        Book book = new Book();
        book.setName(form.getName());
        book.setPrice(form.getPrice());
        book.setStockQuantity(form.getStockQuantity());
        book.setAuthor(form.getAuthor());
        book.setIsbn(form.getIsbn());

        itemService.saveItem(book);
        return "redirect:/";
    }
}
```

- 상품 등록 폼에서 데이터를 입력하고 Submit 버튼을 클릭하면 /items/new를 POST 방식으로 요청
- 상품 저장이 끝나면 상품 목록 화면으로 리다이렉트

## 상품 목록

**상품 목록 컨트롤러**

```java
    @GetMapping("/items")
    public String list(Model model) {
        List<Item> items = itemService.findItems();
        model.addAttribute("items", items);
        return "items/itemList";
    }
```

## 상품 수정

**상품 수정과 관련된 컨트롤러 코드**

```java
    @GetMapping("items/{itemId}/edit")
    public String updateItemForm(@PathVariable("itemId") Long itemId, Model model) {
        Book item = (Book) itemService.findOne(itemId);

        BookForm form = new BookForm();
        form.setId(item.getId());
        form.setName(item.getName());
        form.setPrice(item.getPrice());
        form.setStockQuantity(item.getStockQuantity());
        form.setAuthor(item.getAuthor());
        form.setIsbn(item.getIsbn());

        model.addAttribute("form", form);
        return "items/updateItemForm";
    }

    @PostMapping("items/{itemId}/edit")
    public String updateItem(@PathVariable String itemId, @ModelAttribute("form") BookForm form) {

        Book book = new Book();
        book.setId(form.getId());
        book.setName(form.getName());
        book.setPrice(form.getPrice());
        book.setStockQuantity(form.getStockQuantity());
        book.setAuthor(form.getAuthor());
        book.setIsbn(form.getIsbn());

        itemService.saveItem(book);
        return "redirect:/items";
    }
```

### 상품 수정 폼 이동

1. 수정 버튼을 선택하면 /items/{itemId}/edit URL을 GET 방식으로 요청
2. 그 결과로 updateItemForm() 메서드를 실행하는데 이 메서드는 itemService.findOne(itemId)를 호출해서 수정할 상품을 조회
3. 조회 결과를 모델 객체에 담아서 뷰(items/updateItemForm)에 전달

### 상품 수정 실행

상품 수정 폼 HTML에는 상품의 id(hidden), 상품명, 가격, 수량 정보

1. 상품 수정 폼에는 정보를 수정하고 Submit 버튼을 선택
2. /items/{itemId}/edit URL을 POST 방식으로 요청하고 updateItem() 메서드를 실행
3. 이때 컨트롤러에 파라미터로 넘어온 item 엔티티 인스턴스는 현재 준영속 상태
   1. 영속성 컨텍스트의 지원을 받을 수 없고 데이터를 수정해도 변경 감지 기능은 동작 X

---

itemId 수정하는 부분은 따로 validation이 있는 것이 중요하다

## 변경 감지와 병합(merge)

<aside>
👻 매우 중요한 부분이니 유념할 것

</aside>

준영속 엔티티

- 영속성 컨텍스트가 더는 관리하지 않는 엔티티
  - 현재 상황에선 itemService.saveItem(book)에서 수정을 시도하는 Book 객체를 의미
  - Book 객체는 이미 DB에 한 번 저장되어 있어서 식별자가 존재
  - 임의로 만들어낸 엔티티도 기존 식별자가 있으면 준영속 엔티티로 볼 수 있음
- 준영속 엔티티를 수정하는 2가지 방법
  - 변경 감지 기능 사용
  - 병합(merge) 사용

### 변경 감지 기능 사용

```java
@Transactional
void update(Item itemParam) { //itemParam: 파리미터로 넘어온 준영속 상태의 엔티티
		Item findItem = em.find(Item.class, itemParam.getId()); //같은 엔티티를 조회한다.
    findItem.setPrice(itemParam.getPrice()); //데이터를 수정한다.
}
```

- 영속성 컨텍스트에서 엔티티를 다시 조회한 후에 데이터를 수정하는 방법
  - 트랜잭션 안에서 엔티티를 다시 조회, 변경할 값 선택
  - 트랜잭션 커밋 시점에 변경 감지(Dirty Checking)이 동작해서 데이터베이스에 UPDATE SQL 발생

### 병합 사용

```java
@Transactional
void update(Item itemParam) { //itemParam: 파리미터로 넘어온 준영속 상태의 엔티티
		Item mergeItem = em.merge(itemParam);
}
```

- 병합은 준영속 상태의 엔티티를 영속 상태로 변경할 때 사용하는 기능

**병합 동작 방식**

1. merge()를 실행한다.
2. 파라미터로 넘어온 준영속 엔티티의 식별자 값으로 1차 캐시에서 엔티티를 조회
   1. 만약 1차 캐시에 엔티티가 없으면 데이터베이스에서 엔티티를 조회하고 1차 캐시에 저장
3. 조회한 영속 엔티티(mergeMember)에 member 엔티티의 값을 채워 넣는다.
   1. member 엔티티의 모든 값을 mergeMember에 밀어 넣는다
   2. 이때 mergeMember의 “회원1”이라는 이름이 “회원명변경”으로 바뀐다.
4. 영속 상태인 mergerMember를 반환

**병합시 동작 방식을 간단히 정리**

1. 준영속 엔티티의 식별자 값으로 영속 엔티티를 조회한다.
2. 영속 엔티티의 값을 준영속 엔티티의 값으로 모두 교체한다.
3. 트랜잭션 커밋 시점에 변경 감지 기능이 동작해서 데이터베이스에 UPDATE SQL이 실행

**주의사항**

- 변경 감지 기능을 사용하면 원하는 속성만 선택해서 변경 가능
- 하지만 병합을 사용시 모든 속성이 변경되므로 변경 값이 없으면 NULL로 업데이트 하는 등 문제가 발생할 수 있다.

### 상품 리포지토리의 저장 메서드 분석

**ItemRepository**

```java
package jpabook.jpashop.repository;

@Repository
public class ItemRepository {

    @PersistenceContext
		EntityManager em;

		public void save(Item item) {
				if (item.getId() == null) {
		        em.persist(item);
		    } else {
		        em.merge(item);
		    }
		}
		//...
}
```

- save() 메서드는 식별자 값이 없으면 null을 새로운 엔티티로 판단해서 영속화 시키고 아니라면 병합
- 지금처럼 준영속 상태인 상품 엔티티를 수정할 때는 id 값이 있으므로 병합 수행

### 가장 좋은 해결 방법

**엔티티를 변경할 때는 항상 변경 감지를 사용하세요**

- 컨트롤러에서 어설프게 엔티티를 생성하지 말자
- 트랜잭션이 있는 서비스 계층에 식별자(id)와 변경할 데이터를 명확하게 전달하자 (파라미터 or dto)
- 트랜잭션이 있는 서비스 계층에서 영속 상태의 엔티티를 조회하고 엔티티의 데이터를 직접 변경
- 트랜잭션 커밋 시점에 변경 감지가 실행

**변경 후 코드**

```java
    @PostMapping("items/{itemId}/edit")
    public String updateItem(@PathVariable Long itemId, @ModelAttribute("form") BookForm form) {
        itemService.updateItem(itemId, form.getName(), form.getPrice(), form.getStockQuantity());
        return "redirect:/items";
    }
```

```java
    @Transactional
    public void updateItem(Long itemId, String name, int price, int stockQuantity) {
        Item findItem = ItemRepository.findOne(itemId);
        findItem.setName(name);
        findItem.setPrice(price);
        findItem.setStockQuantity(stockQuantity);
    }
```

## 상품 주문

**상품 주문 컨트롤러**

```java
package jpabook.jpashop.controller;

@Controller
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final MemberService memberService;
    private final ItemService itemService;

    @GetMapping("/order")
    public String createForm(Model model) {

        List<Member> members = memberService.findMembers();
        List<Item> items = itemService.findItems();

        model.addAttribute("members", members);
        model.addAttribute("items", items);

        return "order/orderForm";
    }

    @PostMapping("/order")
    public String order(@RequestParam("memberId") Long memberId,
                        @RequestParam("itemId") Long itemId,
                        @RequestParam("count") int count) {

        orderService.order(memberId, itemId, count);
        return "redirect:/orders";
    }
}
```

**주문 폼 이동**

- 메인 화면에서 상품 주문을 선택하면 /order를 GET 방식으로 호출
- OrderController의 createForm() 메서드
- 주문 화면에는 주문할 고객정보와 상품 정보가 필요하므로 model 객체에 담아서 뷰에 넘김

**주문 실행**

- 주문할 회원과 상품 그리고 수량을 선택해서 Submit 버튼을 누르면 /order URL을 POST 방식으로 호출
- 컨트롤러의 order() 메서드를 실행
  - 이 메서드는 고객 식별자(memberId), 주문할 상품 식별자(itemId), 수량(count) 정보를 받아서 주문 서비스에 주문을 요청
- 주문이 끝나면 상품 주문 내역이 있는 /orders URL로 리다이렉트

---

조회를 제외한 핵심 비즈니스 로직은 컨트롤러가 아닌 서비스 단에서 구현하는 것이 더 좋다

## 주문 목록 검색, 취소

**주문 목록 검색 컨트롤러**

```java
    @GetMapping("/orders")
    public String orderList(@ModelAttribute("orderSearch") OrderSearch orderSearch, Model model) {
        List<Order> orders = orderService.findOrders(orderSearch);
        model.addAttribute("orders", orders);

        return "order/orderList";
    }

```

**주문 목록 취소 컨트롤러**

```java
    @PostMapping("/orders/{orderId}/cancel")
    public String cancelOrder(@PathVariable("orderId") Long orderId) {
        orderService.cancelOrder(orderId);
        return "redirect:/orders";
    }
```
