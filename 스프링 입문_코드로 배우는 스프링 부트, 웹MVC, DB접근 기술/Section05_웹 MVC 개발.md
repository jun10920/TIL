## 회원 웹 기능 - 홈 화면 추가

- 홈 컨트롤러 추가
  ```java
  package hello.hellospring.controller;

  import org.springframework.stereotype.Controller;
  import org.springframework.web.bind.annotation.GetMapping;

  @Controller
  public class HomeController {

      @GetMapping("/")
      public String home() {
          return "home";
      }
  }
  ```
- 회원 관리용 홈
  ```java
  <!DOCTYPE HTML>
  <html xmlns:th="http://www.thymeleaf.org">
  <body>
  <div class="container">
      <div>
          <h1>Hello Spring</h1>
          <p>회원 기능</p>
          <p>
              <a href="/members/new">회원 가입</a>
              <a href="/members">회원 목록</a>
          </p>    </div>
  </div> <!-- /container -->
  </body>
  </html>
  ```

> 참고: 컨트롤러가 정적 파일보다 우선순위가 높다

## 회원 웹 기능 - 등록

- 회원 등록 폼 개발
  - 회원 등록 폼 컨트롤러
  ```java
  package hello.hellospring.controller;

  @Controller
  public class MemberController {

      private final MemberService memberService;

      @Autowired
      public MemberController(MemberService memberService) {
          this.memberService = memberService;
      }
  		// Get은 주로 url에 조회할 때 사용
      @GetMapping("/members/new")
      public String createForm() {
          return "members/createMemberForm";
      }
  }
  ```
  - 회원 등록 폼 HTML / createMemberForm.html
  ```java
  <!DOCTYPE HTML>
  <html xmlns:th="http://www.thymeleaf.org">
  <body>
  <div class="container">
      <form action="/members/new" method="post">        <div class="form-group">
          <label for="name">이름</label>
          <input type="text" id="name" name="name" placeholder="이름을 입력하세요">
      </div>
          <button type="submit">등록</button>
      </form>
  </div> <!-- /container -->
  </body>
  </html>
  ```
- 회원 등록 컨트롤러
  - 웹 등록 화면에서 데이터를 전달 받을 객체
  ```java
  package hello.hellospring.controller;

  public class MemberForm {
      private String name;

      public String getName() {
          return name;
      }
      public void setName(String name) {
          this.name = name;
      }
  }
  ```
  - 회원 컨트롤러에서 회원을 실제 등록하는 기능
  ```java
  @PostMapping("/members/new")
      public String create(MemberForm form) {
          Member member = new Member();
          member.setName(form.getName());

          memberService.join(member);

          return "redirect:/";
  ```

## 회원 웹 기능 - 조회

```java
@GetMapping("/members")
    public String list(Model model) {
        List<Member> members = memberService.findMembers();
        model.addAttribute("members", members);
        return "memberList";
    }
```

- model에 members 리스트를 담아 template의 members/memberLlist.html 파일로 전달

```java
<!DOCTYPE HTML>
<html xmlns:th="http://www.thymeleaf.org">
<body>
<div class="container">
    <div>
        <table>
            <thead>
            <tr>
                <th>#</th>
                <th>이름</th>
            </tr>
            </thead>
            <tbody>
            <tr th:each="member : ${members}">
                <td th:text="${member.id}"></td>
                <td th:text="${member.name}"></td>
            </tr>
            </tbody>
        </table>
    </div>
</div> <!-- /container -->
</body>
</html>
```

- 템플릿 코드로 인해서 members의 member들을 순회해서 반복문으로 출력
