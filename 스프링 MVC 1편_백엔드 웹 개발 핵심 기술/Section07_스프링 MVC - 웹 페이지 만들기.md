# Section07\_스프링 MVC - 웹 페이지 만들기

## 요구사항 분석

**상품 도메인 모델**

- 상품 ID
- 상품명
- 가격
- 수량

**상품 관리 기능**

- 상품 목록
- 상품 상세
- 상품 등록
- 상품 수정

**서비스 제공 흐름**

- 디자이너
  - 요구사항에 맞도록 디자인하고, 디자인 결과물을 웹 퍼블리셔에게 넘겨준다.
- 웹 퍼블리셔
  - 디자이너에게 받은 디자인을 기반을 HTML, CSS를 만들어 개발자에게 제공
- 백엔드 개발자
  - 디자이너, 웹 퍼블리셔를 통해서 HTML 화면이 나오기 전까지 시스템을 설계하고, 핵심 비즈니스 모델을 개발
  - 이후 HTML이 나오면 이 HTML을 뷰 템플릿으로 변환해서 동적으로 화면을 그리고 또 웹 화면의 흐름을 제어한다.
- 웹 프론트엔드 개발자가 있는 경우
  - HTML을 동적으로 만드는 역할과 웹 화면의 흐름을 담당하기 때문에 백엔드 개발자는 HTML 뷰 템플릿을 만지는 대신 HTTP API를 통해 웹 클라이언트가 필요로 하는 데이터와 기능만 제공하면 된다

## 상품 도메인 개발

- **Item - 상품 객체**
  ```java
  package hello.itemservice.domain;

  @Data // 실제 프로젝트에서는 @Data의 범위가 너무 크므로 예상치 못한 결과가 나올 수 있어 조심해야 한다.
  public class Item {

      private Long id;
      private String itemName;
      private Integer price;
      private Integer quantity;

      public Item() {
      }

      public Item(String itemName, Integer price, Integer quantity) {
          this.itemName = itemName;
          this.price = price;
          this.quantity = quantity;
      }
  }

  ```
- **ItemRepository - 상품 저장소**
  ```java
  package hello.itemservice.domain;

  @Repository
  public class ItemRepository {

      private static final Map<Long, Item> store = new HashMap<>(); //static
      private static long sequence = 0L; //static

      public Item save(Item item) {
          item.setId(++sequence);
          store.put(item.getId(), item);
          return item;
      }

      public Item findById(Long id) {
          return store.get(id);
      }

      public List<Item> findAll() {
          return new ArrayList<>(store.values());
      }

      public void update(Long itemId, Item updateParam) {
          Item findItem = findById(itemId);
          findItem.setItemName(updateParam.getItemName());
          findItem.setPrice(updateParam.getPrice());
          findItem.setQuantity(updateParam.getQuantity());
      }

      public void clearStore() {
          store.clear();
      }
  }
  ```
- **ItemRepositoryTest - 상품 저장소 테스트**
  ```java
  package hello.itemservice.domain;

  class ItemRepositoryTest {

      ItemRepository itemRepository = new ItemRepository();

      @AfterEach
      void afterEach() {
          itemRepository.clearStore();
      }

      @Test
      void save() {
          //given
          Item item = new Item("itemA", 10000, 10);
          //when
          Item saveItem = itemRepository.save(item);
          //then
          Item findItem = itemRepository.findById(item.getId());
          assertThat(findItem).isEqualTo(saveItem);
      }

      @Test
      void findAll() {
          //given
          Item item1 = new Item("item1", 10000, 10);
          Item item2 = new Item("item2", 20000, 20);

          itemRepository.save(item1);
          itemRepository.save(item2);

          //when
          List<Item> result = itemRepository.findAll();

          //then
          assertThat(result.size()).isEqualTo(2);
          assertThat(result).contains(item1, item2);
      }

      @Test
      void updateItem() {
          //given
          Item item = new Item("item1", 10000, 10);

          Item savedItem = itemRepository.save(item);
          Long itemId = savedItem.getId();

          //when
          Item updateParam = new Item("item2", 20000, 30);
          itemRepository.update(itemId, updateParam);

          //then
          Item findItem = itemRepository.findById(itemId);

          assertThat(findItem.getItemName()).isEqualTo(updateParam.getItemName());
          assertThat(findItem.getPrice()).isEqualTo(updateParam.getPrice());
          assertThat(findItem.getQuantity()).isEqualTo(updateParam.getQuantity());
      }
  }
  ```

## 상품 서비스 HTML

- 부트스트랩 이용
  - 웹사이트를 쉽게 만들 수 있게 도와주는 HTML, CSS, JS 프레임워크
  - 하나의 CSS로 휴대폰, 테블릿, 데스크탑까지 다양한 기기에서 작동
- 정적 리소스에 HTML 파일 저장
  - 실제 서비스에서도 이렇게 저장하면 공개가 되므로 서비스를 운영한다면 지금처럼 공개할 필요가 없는 HTML을 두는 것은 주의

## 상품 목록 - 타임리프

**BasicItemController**

```java
package hello.itemservice.web.basic;

@Controller
@RequestMapping("/basic/items")
@RequiredArgsConstructor
public class BasicItemController {

    private final ItemRepository itemRepository;

    @GetMapping
    public String items(Model model) {
        List<Item> items = itemRepository.findAll();
        model.addAttribute("items", items);
        return "basic/items";
    }

    /**
     * 테스트용 데이터 추가
     */
    @PostConstruct
    public void init() {
        itemRepository.save(new Item("itemA", 10000, 10));
        itemRepository.save(new Item("itemB", 20000, 20));
    }
}
```

- 컨트롤러 로직
  - itemRepository에서 모든 상품을 조회한 다음 모델에 담기
  - 뷰 템플릿 호출
- `@RequiredArgsConstructor`
  - final이 붙은 멤버변수만 사용해서 생성자를 자동으로 생성

```java
public BasicItemController(ItemRepository itemRepository) {
		this.itemRepository = itemRepository;
}
```

- 위와 같이 생성자가 딱 1개만 있으면 @Autowired로 의존관계 주입
- final 키워드를 빼면 안된다

### 타임리프 간단히 알아보기

- **타임리프 사용 선언**
  - `<html xmlns:th="[http://www.thymeleaf.org](http://www.thymeleaf.org/)">`
- **속성 변경 - th:href**
  - `th:href="@{/css/bootstrap.min.css}"`
    - href="value1" 을 th:href="value2" 의 값으로 변경한다.
    - 타임리프 뷰 템플릿을 거치게 되면 원래 값을 th:xxx 값으로 변경
      - 만약 값이 없다면 새로 생성한다.
    - HTML을 그대로 볼 때는 href 속성이 사용
    - 뷰 템플릿을 거치면 th:href 의 값이 href 로 대체되면서 동적으로 변경
- **타임리프 핵심**
  - 핵심은 th:xxx 가 붙은 부분은 서버사이드에서 렌더링 되고, 기존 것을 대체
    - th:xxx 이 없으면 기존 html의 xxx 속성이 그대로 사용된다.
  - HTML을 파일로 직접 열었을 때, th:xxx 가 있어도 웹 브라우저는 th: 속성을 알지 못하므로 무시
    - 따라서 HTML을 파일 보기를 유지하면서 템플릿 기능 가능
- **URL 링크 표현식 - @{...},**

  - `th:href="@{/css/bootstrap.min.css}"`
    - `@{...}` : 타임리프는 URL 링크를 사용하는 경우 @{...} 를 사용
      - 이것을 **URL 링크 표현식**이라 한다.
      - URL 링크 표현식을 사용하면 서블릿 컨텍스트를 자동으로 포함

- **상품 등록 폼으로 이동**
- **속성 변경 - th:onclick**
  - `onclick="location.href='addForm.html'"`
  - `th:onclick="|location.href='@{/basic/items/add}'|"`
  - 여기에는 다음에 설명하는 리터럴 대체 문법이 사용되었다. 자세히 알아보자.
- **리터럴 대체 - `|...|`**
  - `|...|` :이렇게 사용한다.
  - 타임리프에서 문자와 표현식 등은 분리되어 있기 때문에 더해서 사용해야 한다.
    - `<span th:text="'Welcome to our application, ' + ${[user.name](http://user.name/)} + '!'">`
  - 다음과 같이 리터럴 대체 문법을 사용하면, 더하기 없이 편리하게 사용할 수 있다.
    - `<span th:text="|Welcome to our application, ${[user.name](http://user.name/)}!|">`
  - 결과를 다음과 같이 만들어야 하는데
    - `location.href='/basic/items/add'`
  - 그냥 사용하면 문자와 표현식을 각각 따로 더해서 사용해야 해서 복잡해진다.
    - `th:onclick="'location.href=' + '\'' + @{/basic/items/add} + '\''"`
  - 리터럴 대체 문법을 사용하면 다음과 같이 편리하게 사용할 수 있다.
    - `th:onclick="|location.href='@{/basic/items/add}'|"`
- **반복 출력 - th:each**
  - `<tr th:each="item : ${items}">`
  - 반복은 th:each 를 사용
    - 모델에 포함된 items 컬렉션 데이터가 item 변수에하나씩 포함
    - 반복문 안에서 item 변수를 사용
    - 컬렉션의 수 만큼 <tr>..</tr> 이 하위 태그를 포함해서 생성
- **변수 표현식 - ${...}**
  - `<td th:text="${item.price}">10000</td>`
    - 모델에 포함된 값이나, 타임리프 변수로 선언한 값을 조회
    - 프로퍼티 접근법을 사용 ( item.getPrice()
- **내용 변경 - th:text**
  - `<td th:text="${item.price}">10000</td>`
    - 내용의 값을 th:text 의 값으로 변경
    - 여기서는 10000을 ${item.price} 의 값으로 변경
- **URL 링크 표현식2 - @{...},**
  - th:href="@{/basic/items/{itemId}(itemId=${[item.id](http://item.id/)})}"상품 ID를 선택하는 링크를 확인
  - URL 링크 표현식을 사용하면 경로를 템플릿처럼 편리하게 사용
  - 경로 변수( {itemId} ) 뿐만 아니라 쿼리 파라미터도 생성
  - `예) th:href="@{/basic/items/{itemId}(itemId=${[item.id](http://item.id/)}, query='test')}"`
    - 생성 링크: http://localhost:8080/basic/items/1?query=test
- **URL 링크 간단히**
  - `th:href="@{|/basic/items/${[item.id](http://item.id/)}|}"`
  - 상품 이름을 선택하는 링크를 확인
  - 리터럴 대체 문법을 활용해서 간단히 사용 가능

**네츄럴 템플릿**

- 순수 HTML을 그대로 유지하면서 뷰 템플릿도 사용할 수 있는 타임리프
- 타임리프의 특성 중 하나

## 상품 상세

**BasicItemController에 추가**

```java
@GetMapping("/{itemId}")
    public String item(@PathVariable long itemId, Model model) {
        Item item = itemRepository.findById(itemId);
        model.addAttribute("item", item);
        return "basic/item";
    }
```

`@PathVariable` 로 넘어온 상품ID로 상품을 조회하고 모델에 담아둔다. 그리고 view 호출

**상품 상세 뷰**

```java
<!DOCTYPE HTML>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="utf-8">
    <link th:href="@{/css/bootstrap.min.css}"
          href="../css/bootstrap.min.css" rel="stylesheet">

    <style>
        .container {
            max-width: 560px;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="py-5 text-center">
        <h2>상품 상세</h2>
    </div>
    <div>
        <label for="itemId">상품 ID</label>
        <input type="text" id="itemId" name="itemId" class="form-control"
               value="1" th:value="${item.id}" readonly>
    </div>
    <div>
        <label for="itemName">상품명</label>
        <input type="text" id="itemName" name="itemName" class="form-control"
               value="상품A" th:value="${item.itemName}" readonly>
    </div>
    <div>
        <label for="price">가격</label>
        <input type="text" id="price" name="price" class="form-control" value="10000" th:value="${item.price}"readonly>
    </div>
    <div>
        <label for="quantity">수량</label>
        <input type="text" id="quantity" name="quantity" class="form-control"
               value="10" th:value="${item.quantity}" readonly>
    </div>
    <hr class="my-4">
    <div class="row">
        <div class="col">
            <button class="w-100 btn btn-primary btn-lg"
                    onclick="location.href='editForm.html'"
                    th:onclick="|location.href='@{/basic/items/{itemId}/edit(itemId=${item.id})}'|"
                    type="button">상품 수정</button>
        </div>
        <div class="col">
            <button class="w-100 btn btn-secondary btn-lg"
                    onclick="location.href='items.html'"
                    th:onclick="|location.href='@{/basic/items}'|"
                    type="button">목록으로</button>
        </div>
    </div>
</div> <!-- /container -->
</body>
</html>
```

- **속성 변경 - th:value**
  - `th:value="${[item.id](http://item.id/)}"`
  - 모델에 있는 item 정보를 획득하고 프로퍼티 접근법으로 출력한다. ( item.getId() )
  - value 속성을 th:value 속성으로 변경한다.
- **상품수정 링크**
  - `th:onclick="|location.href='@{/basic/items/{itemId}/edit(itemId=${[item.id](http://item.id/)})}'|"`
- **목록으로 링크**
  - `th:onclick="|location.href='@{/basic/items}'|"`

## 상품 등록 폼

**컨트롤러에 추가**

```java
	 	@GetMapping("/add")
    public String addForm() {
        return "basic/addForm";
    }

    @PostMapping("/add")
    public String save() {
        return "basic/addForm";
    }
```

**상품 등록 폼 HTML**

```java
<!DOCTYPE HTML>
<html xmlns:th="http://www.thymeleaf.org">
<head>
  <meta charset="utf-8">
  <link th:href="@{/css/bootstrap.min.css}"
        href="../css/bootstrap.min.css" rel="stylesheet">
  <style>
    .container {
      max-width: 560px;
    }
  </style>
</head>
<body>
<div class="container">    <div class="py-5 text-center">
  <h2>상품 등록 폼</h2>
</div>
  <h4 class="mb-3">상품 입력</h4>
  <form action="item.html" th:action method="post"> <!--   th:action 옆을 비워두면 현재 url에 적용 된다-->
    <div>
      <label for="itemName">상품명</label>
      <input type="text" id="itemName" name="itemName" class="form-control" placeholder="이름을 입력하세요">
    </div>
    <div>
      <label for="price">가격</label>
      <input type="text" id="price" name="price" class="form-control" placeholder="가격을 입력하세요">
    </div>
    <div>
      <label for="quantity">수량</label>
      <input type="text" id="quantity" name="quantity" class="form-control" placeholder="수량을 입력하세요">
    </div>
    <hr class="my-4">
    <div class="row">
      <div class="col">
        <button class="w-100 btn btn-primary btn-lg" type="submit">상품 등록</button>
      </div>
      <div class="col">
        <button class="w-100 btn btn-secondary btn-lg"
                onclick="location.href='items.html'"
                th:onclick="|location.href='@{/basic/items}'|"
                type="button">취소</button>
      </div>
    </div>
  </form>
</div> <!-- /container -->
</body>
</html>
```

**속성 변경 - th:action**

- HTML form에서 action에 값이 없으면 현재 url에 데이터를 전송
- 상품 등록 폼의 url과 상품 등록을 처리하는 url을 맞추고 HTTP 메서드로 두 기능을 구분
  - 상품 등록 폼 GetMapping
  - 상품 등록 처리 PostMapping

취소

- 취소시 상품 목록으로 이동
- `th:onclick="|location.href='@{/basic/items}'|”`

## 상품 등록 처리 - @ModelAttribute

- Form 데이터 형식으로 Post 방식으로 처리

**@RequestParam**

```java
//    @PostMapping("/add")
    public String addItemV1(@RequestParam String itemName,
                       @RequestParam int price,
                       @RequestParam Integer quantity,
                       Model model) {

        Item item = new Item();
        item.setItemName(itemName);
        item.setPrice(price);
        item.setQuantity(quantity);

        itemRepository.save(item);

        model.addAttribute("item", item);

        return "basic/item";
    }
```

- 요청 파라미터의 정보를 @RequestParam에 저장
- Item 객체를 생성해 itemRepository에 저장
- item을 모델에 담아서 뷰에 전달

**@ModelAttribute**

```java
//    @PostMapping("/add")
    public String addItemV2(@ModelAttribute("item") Item item) {

        itemRepository.save(item);
//        model.addAttribute("item", item); @ModelAttribute를 사용하면 자동 추가된다

        return "basic/item";
    }
```

- 요청 파라미터 처리
  - Item 객체 생성
  - 요청 파라미터의 값을 프로터피 접근법으로 입력
- Model 추가
  - 모델에 `@ModelAttribute` 지정한 객체를 자동으로 넣어준다.
  - 위 코드처럼 주석으로 처리해도 잘 동작한다
  - 모델에 데이터를 자동으로 담을 때는 이름이 필요해서 name(value) 속성을 사용한다
    - 만약 이 이름도 생락하면 클래스 명을 소문자로 바꾼 것을 name으로 사용

```java
@PostMapping("/add")
    public String addItemV4(Item item) {
        itemRepository.save(item);
        return "basic/item";
    }
```

- 위 코드처럼 ModelAttribute 애노테이션 자체를 생략해도 가능하다.
- 하지만 코드의 목적을 뚜렷하게 보기 어렵고, 서로에게 오해의 소지가 있으니 사용을 조심해야 한다.

## 상품 수정

**상품 수정 폼 컨트롤러**

```java
@GetMapping("/{itemId}/edit")
    public String editForm(@PathVariable Long itemId, Model model) {
        Item item = itemRepository.findById(itemId);
        model.addAttribute("item", item);
        return "basic/editForm";
    }
```

**상품 수정 폼 뷰**

```java
<!DOCTYPE HTML>
<html>
<head>
  <meta charset="utf-8">
  <link href="../css/bootstrap.min.css" rel="stylesheet">
  <style>
    .container {
      max-width: 560px;
    }
  </style>
</head>
<body>
<div class="container">
  <div class="py-5 text-center">
    <h2>상품 수정 폼</h2>
  </div>
  <form action="item.html" method="post">
    <div>
      <label for="id">상품 ID</label>
      <input type="text" id="id" name="id" class="form-control" value="1"
             readonly>
    </div>
    <div>
      <label for="itemName">상품명</label>
      <input type="text" id="itemName" name="itemName" class="form-
control" value="상품A">
    </div>
    <div>
      <label for="price">가격</label>
      <input type="text" id="price" name="price" class="form-control"
             value="10000">
    </div>
    <div>
      <label for="quantity">수량</label>
      <input type="text" id="quantity" name="quantity" class="form-control" value="10">
    </div>
    <hr class="my-4">        <div class="row">
    <div class="col">
      <button class="w-100 btn btn-primary btn-lg" type="submit">저장</
      button>
    </div>
    <div class="col">
      <button class="w-100 btn btn-secondary btn-lg"
              onclick="location.href='item.html'" type="button">취소</button>
    </div>
  </div>
  </form>
</div> <!-- /container -->
</body>
</html>
```

### 상품 수정 개발

```java
@PostMapping("/{itemId}/edit")
    public String edit(@PathVariable Long itemId, @ModelAttribute Item item) {
        itemRepository.update(itemId, item);
        return "redirect:/basic/items/{itemId}";
    }
```

- 상품 수정은 상품 등록과 전체 프로세스가 유사
  - 같은 URL을 GET과 POST 방식으로 수정

**리다이렉트**

상품 수정은 마지막에 뷰 템플릿 호출 대신 상품 상세 화면으로 이동하도록 리다이렉트를 호출

- 스프링은 redirect:/…으로 리다이렉트 지원
- `redirect:/basic/items/{itemId}`
  - `@PathVariable` 의 값을 redirect에도 사용 가능

## PRG Post/Redirect/Get

- 현재 등록 컨트롤러는 등록을 완료하고 새로고침하면 계속 중복 등록되는 오류가 있다.
- **POST 등록 후 새로 고침**
- 새로고침은 마지막에 서버에 전송한 데이터를 다시 전송

  - 그래서 POST/add + 상품 데이터가 서버로 전송되어 중복 등록이 되는 현상이 생김
  - 이를 Post/Redirect/Get 방식으로 해결

- 마지막에 뷰 템플릿이 아니라 상품 상세 화면으로 리다이렉트를 호출
  - 마지막에 호출한 내용이 상품 상세 화면인 GET/items/{id}로 리다이렉트
  - 새로고침해도 GET이 호출

**리다이렉트로 수정한 컨트롤러 코드 일부**

```java
@PostMapping("/add")
    public String addItemV5(Item item) {
        itemRepository.save(item);
        return "redirect:/basic/items/" + item.getId();
    }
```

- `item.getId()` 처럼 URL에 변수를 더해서 사용하는 것은 URL 인코딩이 안되서 위험하다
  - 이를 위해서 RedirectAttributes를 사용

## RedirectAttributes

- 위에서 언급한 문제 뿐만 아니라, 등록이 완료된 것을 고객에서 안내하는 메시지를 보여주는 기능 또한 추가하겠다.

```java
@PostMapping("/add")
    public String addItemV6(Item item, RedirectAttributes redirectAttributes) {
        Item saveItem = itemRepository.save(item);
        redirectAttributes.addAttribute("itemId", saveItem.getId());
        redirectAttributes.addAttribute("status", true);
        return "redirect:/basic/items/{itemId}";
    }
```

- RedirectAttributes을 사용하면 URL 인코딩, pathVariable, 쿼리 파라미터를 처리
  - `redirect:/basic/items/{itemId}`
    - pathVariable 바인딩: {itemId}
    - 나머지는 쿼리 파라미터로 처리 ?status=true

**뷰 템플릿 메시지 추가**

```java
<div class="container">
    <div class="py-5 text-center">
        <h2>상품 상세</h2>
    </div>
<!-- 추가 -->
    <h2 th:if="${param.status}" th:text="'저장 완료!'"></h2>
```

- `th:if` : 해당 조건이 참이면 실행
  - `${param.status}` : 타임리프에서 쿼리 파라미터를 편리하게 조회하는 기능
    - 원래는 컨트롤러에서 모델에 직접 담고 값을 꺼내야 한다. 그런데 쿼리 파라미터는 자주 사용해서 타임리프에서 직접 지원
