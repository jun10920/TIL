# Section05\_스프링MVC - 구조 이해

## 스프링 MVC 전체 구조

- 직접 만든 프레임워크 & 스프링 MVC 비교
  - FrontController → **DispatcherServlet**
  - handlerMappingMap → **HandlerMapping**
  - MyHandlerAdapter → **HandlerAdapter**
  - ModelView → **ModelAndView**
  - viewResolver → **ViewResolver**
  - MyView → **View**

### **DispatcherServlet**

- 우리 프레임워크의 프론트 컨트롤러가 MVC의 **DispatcherServlet**이다
- **DispatcherServlet 서블릿 등록**
  - HttpServlet을 상속 받아서 사용
    - DispatcherServlet→FrameworkServlet→HttpServletBean→HttpServlet
  - 모든 경로에 매핑: urlPatterns=”/”
- **요청 흐름**
  - 서블릿이 호출되면 HttpServlet이 제공하는 service() 호출
    - 스프링 MVC는 DispatcherServlet의 부모인 FrameworkServlet의 service()를 오버라이드한 상태
    - 이후 service 메서드 안에서 DispatcherServlet.doDispatch() 메서드 호출
- **DispatcherServlet.doDispatch()**
  - 예외 처리와 인터셉트 부분을 제외한 부분
  ```java
  protected void doDispatch(HttpServletRequest request, HttpServletResponse
  response) throws Exception {
  HttpServletRequest processedRequest = request;
  HandlerExecutionChain mappedHandler = null;
  ModelAndView mv = null;

  // 1. 핸들러 조회
  mappedHandler = getHandler(processedRequest);
  if (mappedHandler == null) {
  noHandlerFound(processedRequest, response);
  return;
  }

  // 2. 핸들러 어댑터 조회 - 핸들러를 처리할 수 있는 어댑터
  HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

  // 3. 핸들러 어댑터 실행 -> 4. 핸들러 어댑터를 통해 핸들러 실행 -> 5. ModelAndView 반환
  mv = ha.handle(processedRequest, response, mappedHandler.getHandler());
  processDispatchResult(processedRequest, response, mappedHandler, mv,
  dispatchException);
  }

  private void processDispatchResult(HttpServletRequest request,
  HttpServletResponse response, HandlerExecutionChain mappedHandler, ModelAndView
  mv, Exception exception) throws Exception {// 뷰 렌더링 호출
  render(mv, request, response);
  }

  protected void render(ModelAndView mv, HttpServletRequest request,
  HttpServletResponse response) throws Exception {
  View view;
  String viewName = mv.getViewName();

  // 6. 뷰 리졸버를 통해서 뷰 찾기, 7. View 반환
  view = resolveViewName(viewName, mv.getModelInternal(), locale, request);

  // 8. 뷰 렌더링
  view.render(mv.getModelInternal(), request, response);
  }
  ```
- **동작 순서**
  - 핸들러 조회
    - 핸들러 매핑을 통해서 요청 URL에 매핑된 핸들러를 조회
  - 핸들러 어댑터 조회
    - 핸들러를 실행할 수 있는 핸들러 어댑터를 조회
  - 핸들러 어댑터 실행
    - 핸들러 어댑터 실행
  - 핸들러 실행
    - 핸들러 어댑터가 실제 핸들러를 실행
  - ModelaAndView 반환
    - 핸들러 어댑터는 핸들러가 반환하는 정보를 ModelAndView로 반환
  - viewResolver 호출
    - 뷰 리졸버를 찾고 실행
  - View 반환
    - 뷰 리졸버는 뷰의 논리 이름을 물리 이름으로 바꾸고, 렌더링 역할을 담당하는 뷰 객체를 반환
  - 뷰 렌더링
    - 뷰를 통해서 뷰를 렌더링

## 핸들러 매핑과 핸들러 어댑터

- 현재는 사용하지 않지만 과거에 주로 사용했던 스프링이 제공하는 간단한 컨트롤러로 핸들러 매핑과 어댑터를 이해

### 스프링 부트가 자동 등록하는 핸들러 매핑과 핸들러 어댑터

- 핸들러 매핑과 어댑터 모두 순서대로 찾고 없으면 다음 순서로 넘어간다.
- 동작 방식
  1. 핸들러 매핑으로 핸들러 조회
     1. 애노테이션이나 빈 이름을 통해 핸들러를 조회
  2. 핸들러 어댑터 조회
     1. supports() 메서드를 통해서 어댑터를 찾는다
  3. 핸들러 어댑터 실행
     1. 해당 어댑터를 통해서 컨트롤러를 실행하고, 그 결과 view or viewandmodel을 반환
- **@RequestMapping**
  - 가장 우선순위가 높은 핸들러 매핑과 핸들러 어댑터이므로, 이는 현재 실무에서 대부분 사용하는 애노테이션 기반의 컨트롤러를 지원하는 매핑과 어댑터이다.

## 뷰 리졸버

- **OldController - View 조회할 수 있도록 변경**
  ```java
  package hello.servlet.web.springmvc.old;

  import jakarta.servlet.http.HttpServletRequest;
  import jakarta.servlet.http.HttpServletResponse;
  import org.springframework.stereotype.Component;
  import org.springframework.web.servlet.ModelAndView;
  import org.springframework.web.servlet.mvc.Controller;

  @Component("/springmvc/old-controller")
  public class OldController implements Controller {
      @Override
      public ModelAndView handleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {
          System.out.println("OldController.handleRequest");
          return new ModelAndView("new-form"); // 추가
      }
  }
  ```
  - 컨트롤러는 정상 호출되지만 논리 이름만 전달되서 오류 발생
  - 그래서 **application.properties에 코드 추가**
  ```java
  spring.mvc.view.prefix=/WEB-INF/views/
  spring.mvc.view.suffix=.jsp
  ```
  - 스프링 부트는 InternalResourceVIewReolver라는 뷰 리졸버를 자동 등록
  - 이때 application.properties에 등록한 prefix와 suffix의 설정 정보를 이용해 자동 등록
  - 권장되지는 않지만 전체 경로를 제공해도 동작한다
    - 전체 경로 `return new ModelAndView("/WEB-INF/views/new-form.jsp");`

### 뷰 리졸버 동작 방식

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/0aaf4a74-921a-401b-8ef7-79a743f1e4df/3680029b-d8ea-47ce-8c99-ba0d99ff17a7/Untitled.png)

- 스프링 부트가 자동 등록하는 뷰 리졸버
  ```java
  1 = BeanNameViewResolver         : 빈 이름으로 뷰를 찾아서 반환한다. (예: 엑셀 파일 생성 기능
  에 사용)
  2 = InternalResourceViewResolver : JSP를 처리할 수 있는 뷰를 반환한다.
  ```
  - 실제로는 더 많지만 중요한 부분 위주로 설명
  1. 핸들러 어댑터 호출
     1. 핸들러 어댑터를 통해 new-form이라는 논리 뷰 이름 획득
  2. ViewResolver 호출
     1. new-form이라는 뷰 이름으로 viewResolver 순서대로 호출
     2. BeanNameViewResolver가 new-form인 스프링 빈을 찾았지만 없음
     3. InternalResourceViewResolver 호출
  3. InternalResourceViewResolver
     1. InternalResourceView 반환
  4. 뷰 - InternalResourceView
     1. view.render()
     2. JSP처럼 forward()를 호출해서 처리할 수 있는 경우 사용

## 스프링 MVC - 시작하기

- 스프링의 컨트롤러는 애노테이션 기반으로 동작해서 매우 유연하고 실용적
- RequestMapping
  - RequestMappingHandlerMapping
  - RequestMappingHandlerAdapter
- 기존의 컨트롤러들을 애노테이션 기반으로 수정해보자
- 회원 등록 폼

```java
package hello.servlet.web.springmvc.v1;

@Controller
public class SpringMemberFormControllerV1 {

    @RequestMapping("/springmvc/v1/members/new-form")
    public ModelAndView process() {
        return new ModelAndView("new-form");
    }
}
```

- @Controller
  - 스프링이 자동으로 스프링 빈으로 등록
    - @Controller 내부에 @Component 애노테이션이 있기 때문
- @RequestMapping
  - 요청 정보를 매핑
  - 애노테이션 기반으로 동작하기 때문에 메서드의 이름은 임의로 지어도 된다
- ModelAndView
  - 모델과 뷰 정보를 담아서 반환
- 컴포넌트 스캔 없이 직접 스프링 빈으로 등록해도 동작
  ```java
  //스프링 빈 직접 등록
  @Bean
  SpringMemberFormControllerV1 springMemberFormControllerV1() {
  return new SpringMemberFormControllerV1();
  }
  ```
- 회원 저장
  ```java
  package hello.servlet.web.springmvc.v1;

  @Controller
  public class SpringMemberSaveControllerV1 {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @RequestMapping("springmvc/v1/members/save")
      public ModelAndView process(HttpServletRequest request, HttpServletResponse response) {
          String username = request.getParameter("username");
          int age = Integer.parseInt(request.getParameter("age"));

          Member member = new Member(username, age);
          memberRepository.save(member);

          ModelAndView mv = new ModelAndView("save-result");
          mv.addObject("member", member);
          return mv;
      }

  }
  ```
  - 이전에 작성한 코드와 거의 같지만 model에 추가할 때 addObject()를 사용
- 회원 목록
  ```java
  package hello.servlet.web.springmvc.v1;

  @Controller
  public class SpringMemberListControllerV1 {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @RequestMapping("/springmvc/v1/members")
      public ModelAndView process() {

          List<Member> members = memberRepository.findAll();

          ModelAndView mv = new ModelAndView("members");
          mv.addObject("members", members);
          return mv;
      }
  }
  ```

## 스프링 MVC - 컨트롤러 통합

- @RequestMapping은 메서드 단위로 적용하기 때문에 컨트롤러 클래스를 하나로 통합 가능하다.
- SpringMemberControllerV2
  ```java
  package hello.servlet.web.springmvc.v2;

  @Controller
  @RequestMapping("/springmvc/v2/members")
  public class SpringMemberControllerV2 {
      private MemberRepository memberRepository = MemberRepository.getInstance();

      @RequestMapping("/new-form")
      public ModelAndView newForm() {
          return new ModelAndView("new-form");
      }

      @RequestMapping("/save")
      public ModelAndView save(HttpServletRequest request, HttpServletResponse response) {
          String username = request.getParameter("username");
          int age = Integer.parseInt(request.getParameter("age"));

          Member member = new Member(username, age);
          memberRepository.save(member);

          ModelAndView mv = new ModelAndView("save-result");
          mv.addObject("member", member);
          return mv;
      }

      @RequestMapping()
      public ModelAndView members() {

          List<Member> members = memberRepository.findAll();

          ModelAndView mv = new ModelAndView("members");
          mv.addObject("members", members);
          return mv;
      }
  }
  ```
- `@RequestMapping("/springmvc/v2/members")`
  - 를 통해서 viewName을 조합할 수 있다.

## 스프링 MVC - 실용적인 방식

```java
package hello.servlet.web.springmvc.v3;

@Controller
@RequestMapping("/springmvc/v3/members")
public class SpringMemberControllerV3 {
    private MemberRepository memberRepository = MemberRepository.getInstance();

    @GetMapping("/new-form")
//    @RequestMapping(value = "/new-form", method = RequestMethod.GET)
    public String newForm() {
        return "new-form";
    }

    @PostMapping("/save")
    public String save(
            @RequestParam("username") String username,
            @RequestParam("age") int age,
            Model model
    ) {
        Member member = new Member(username, age);
        memberRepository.save(member);

        model.addAttribute("member", member);
        return "save-result";
    }

    @GetMapping()
    public String members(Model model) {

        List<Member> members = memberRepository.findAll();

        model.addAttribute("members", members);
        return "members";
    }
}
```

- ViewName을 직접 반환
  - 뷰의 논리 이름을 반환할 수 있다
- @RequestParam 사용
  - HTTP 요청 파라미터를 @RequestParam으로 받을 수 있다
  - `@RequestParam("username")` 은 `request.getParameter("username")` 과 거의 같다
- @RequestMapping → @GetMapping, @PostMapping
  - URL뿐만 아니라 HTTP method도 함께 구분 가능하다
  - `@RequestMapping(value = "/new-form", method = RequestMethod.GET)` 이런 방식도 가능하나 `@GetMapping, @PostMapping` 이렇게 더 편리하게 사용도 가능
    - 모든 HTTP method 가능
