# Section04_MVC 프레임워크 만들기

## 프론트 컨트롤러 패턴 소개

**FrontController 패턴 특징**

- 프론트 컨트롤러 서블릿 하나로 클라이언트의 요청을 받음
- 프론트 컨트롤러가 요청에 맞는 컨트롤러를 찾아서 호출
  - 나머지 컨트롤러는 서블릿을 사용하지 않아도 됨

**스프링 웹 MVC와 프론트 컨트롤러**

- 스프링 웹 MVC의 핵심이 FrontController
  - DispactcherServlet이 FrontController 패턴으로 구현

## 프론트 컨트롤러 도입 - v1

- **ControllerV1**
  ```java
  package hello.servlet.web.frontcontroller.v1;

  public interface ControllerV1 {

      void process(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException;
  }
  ```
  - 서블릿과 비슷한 모양의 컨트롤러 인터페이스 도입
    - 프론트 컨트롤러가 이 인터페이스를 호출해 구현과 상관없이 로직을 사용하기 위함
      - 다형성 사용
- **회원 등록 컨트롤러**
  ```java
  package hello.servlet.web.frontcontroller.v1.controller;

  public class MemberFormControllerV1 implements ControllerV1 {

      @Override
      public void process(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          String viewPath = "/WEB-INF/views/new-form.jsp";
          RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
          dispatcher.forward(request, response);
      }
  }
  ```
- **회원 저장 컨트롤러**
  ```java
  package hello.servlet.web.frontcontroller.v1.controller;

  public class MemberSaveControllerV1 implements ControllerV1 {

      private MemberRepository memberRepository = MemberRepository.getInstance();
      @Override
      public void process(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          String username = request.getParameter("username");
          int age = Integer.parseInt(request.getParameter("age"));

          Member member = new Member(username, age);
          memberRepository.save(member);

          //Model에 데이터를 보관
          request.setAttribute("member", member);

          String viewPath = "/WEB-INF/views/save-result.jsp";
          RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
          dispatcher.forward(request,response);
      }
  }
  ```
- **회원 목록 컨트롤러**
  ```java
  package hello.servlet.web.frontcontroller.v1.controller;

  public class MemberListControllerV1 implements ControllerV1 {
      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      public void process(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          List<Member> members = memberRepository.findAll();

          request.setAttribute("members", members);

          String viewPath = "/WEB-INF/views/members.jsp";
          RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
          dispatcher.forward(request, response);
      }
  }
  ```
  - 3개 모두 내부 로직은 기존 서블릿과 비슷
- **프론트 컨트롤러**
  ```java
  package hello.servlet.web.frontcontroller.v1;

  @WebServlet(name = "frontControllerServletV1", urlPatterns = "/front-controller/v1/*")
  public class FrontControllerServletV1 extends HttpServlet {

      private Map<String, ControllerV1> controllerMap = new HashMap<>();

      public FrontControllerServletV1() {
          controllerMap.put("/front-controller/v1/members/new-form", new MemberFormControllerV1());
          controllerMap.put("/front-controller/v1/members/save", new MemberSaveControllerV1());
          controllerMap.put("/front-controller/v1/members", new MemberListControllerV1());
      }

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          System.out.println("FrontControllerServletV1.service");

          String requestURI = request.getRequestURI();

          ControllerV1 controller = controllerMap.get(requestURI);
          if (controller == null) {
              response.setStatus(HttpServletResponse.SC_NOT_FOUND );
              return;
          }

          controller.process(request, response);
      }
  }

  ```
  - `urlPatterns = "/front-controller/v1/*"`
    - /front-controller/v1의 모든 하위 요청은 이 서블릿에서 받는다
  - controllerMap
    - key: 매핑 URL
    - value: 호출된 컨트롤러
  - service
    - requestURI 조회해서 실제 컨트롤러를 controllerMap에서 찾기
    - 없다면 404 상태 코드 반환
    - 있다면 controller.process() 메서드 호출해서 해당 컨트롤러 실행
  - JSP
    - 이전 MVC 그대로 사용
- 리팩토링을 할 때는 같은 레벨 단위끼리 우선적으로 해야 한다
  - 구조를 개선할 때는 구조만
  - 디테일한 부분을 할 때는 디테일한 부분만

## View 분리 - v2

모든 컨트롤러에서 뷰로 이동하는 부분에 중복이 있고, 깔끔하지 않은 문제가 있다

```java
String viewPath = "/WEB-INF/views/new-form.jsp";
RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
dispatcher.forward(request, response);
```

- **MyVIew**
  ```java
  package hello.servlet.web.frontcontroller;

  public class MyView {
      private String viewPath;

      public MyView(String viewPath) {
          this.viewPath = viewPath;
      }

      public void render(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
          dispatcher.forward(request, response);
      }
  }
  ```
  - 뷰 객체는 다른 버전에서도 사용하므로 경로를 froncontroller에 두었다
- **ControllerV2**
  ```java
  package hello.servlet.web.frontcontroller.V2;
  import java.io.IOException;

  public interface ControllerV2 {
      MyView process(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException;
  }

  ```
- **회원 등록 폼**
  ```java
  package hello.servlet.web.frontcontroller.V2.controller;

  import java.io.IOException;

  public class MemberFormControllerV2 implements ControllerV2 {
      @Override
      public MyView process(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          return new MyView("/WEB-INF/views/new-form.jsp");
      }
  }

  ```
  - 각 컨트롤러에서 위에서 언급한 중복되는 로직을 계속 작성하지 않고 Myview 객체에 viewpath만 지정해 반환하면 된다
- **회원 저장**
  ```java
  package hello.servlet.web.frontcontroller.V2.controller;

  public class MemberSaveControllerV2 implements ControllerV2 {

      private MemberRepository memberRepository = MemberRepository.getInstance();
      @Override
      public MyView process(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          String username = request.getParameter("username");
          int age = Integer.parseInt(request.getParameter("age"));

          Member member = new Member(username, age);
          memberRepository.save(member);

          //Model에 데이터를 보관
          request.setAttribute("member", member);

          return new MyView("/WEB-INF/views/save-result.jsp");
      }
  }
  ```
- **회원 목록**
  ```java
  package hello.servlet.web.frontcontroller.V2.controller;

  public class MemberLIstControllerV2 implements ControllerV2 {

      private MemberRepository memberRepository = MemberRepository.getInstance();
      @Override
      public MyView process(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

          List<Member> members = memberRepository.findAll();
          request.setAttribute("members", members);
          return new MyView("/WEB-INF/views/members.jsp");
      }
  }

  ```
- **프론트 컨트롤러 V2**
  ```java
  package hello.servlet.web.frontcontroller.V2;

  @WebServlet(name = "frontControllerServletV2", urlPatterns = "/front-controller/v2/*")
  public class FrontControllerServletV2 extends HttpServlet {

      private Map<String, ControllerV2> controllerMap = new HashMap<>();

      public FrontControllerServletV2() {
          controllerMap.put("/front-controller/v2/members/new-form", new MemberFormControllerV2());
          controllerMap.put("/front-controller/v2/members/save", new MemberSaveControllerV2());
          controllerMap.put("/front-controller/v2/members", new MemberLIstControllerV2());
      }

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

          String requestURI = request.getRequestURI();

          ControllerV2 controller = controllerMap.get(requestURI);
          if (controller == null) {
              response.setStatus(HttpServletResponse.SC_NOT_FOUND );
              return;
          }

          MyView view = controller.process(request, response);
          view.render(request,response);
      }
  }

  ```
  - ControllerV2의 반환 타입이 MyView이므로 프론트 컨트롤러는 컨트롤러 호출 결과로 MyView를 반환 받는다
  - 프론트 컨트롤러가 view의 render 메서드를 실행하면 forward 로직을 수행해 JSP가 실행 된다
- MyView.render()
  ```java
  public void render(HttpServletRequest request, HttpServletResponse response)
  throws ServletException, IOException {
  RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
      dispatcher.forward(request, response);
  ```
- 프론트 컨트롤러의 도입
  - Myview 객체의 render()를 호출하는 부분을 일관되게 처리 가능
- View의 도입
  - ViewPath를 매개해서 JSP를 실행하는 로직을 View가 맡으므로 코드를 유지 보수하게 만들었다.

## Model 추가 - v3

- **서블릿 종속성 제거**
  - 요청 파라미터 정보를 자바의 Map에 넘기면 컨트롤러가 서블릿과 무관하게 동작 가능
  - request 객체를 Model로 사용하는 대신에 별도의 Model 객체를 만들어서 반환
- **뷰 이름 중복 제거**

  - ViewPath에 이름이 중복으로 있는 것을 확인
    - 컨트롤러는 뷰의 논리 이름만 반환
    - 실제 물리 위치의 이름은 프론트 컨트롤러에서 처리
      - 뷰의 폴더 위치가 변경되도 프론트 컨트롤러만 변경
  - /WEB-INF/views/new-form.jsp → **new-form**
  - /WEB-INF/views/save-result.jsp → **save-result**
  - /WEB-INF/views/members.jsp → **members**

- **ModelView**
  ```java
  package hello.servlet.web.frontcontroller;

  import java.util.HashMap;
  import java.util.Map;

  public class ModelView {
      private String viewName;
      private Map<String, Object> model = new HashMap<>();

      public ModelView(String viewName) {
          this.viewName = viewName;
      }

      public String getViewName() {
          return viewName;
      }

      public void setViewName(String viewName) {
          this.viewName = viewName;
      }

      public Map<String, Object> getModel() {
          return model;
      }

      public void setModel(Map<String, Object> model) {
          this.model = model;
      }
  }

  ```
  - 뷰를 렌더링할 때 필요한 model 객체
    - 컨트롤러에서 뷰에 필요한 데이터를 key, value 형태로 삽입
  - View 이름
- **ControllerV3**
  ```java
  package hello.servlet.web.frontcontroller.v3;

  public interface ControllerV3 {

      ModelView process(Map<String, String> paramMap);
  }
  ```
  - 서블릿 기술을 전혀 사용하지 않음
    - 구현이 매우 단순해지고, 테스트 코드 작성이 용이함
  - HttpServletRequest가 제공하는 파라미터는 프론트 컨트롤러가 paramMap에 담아서 호출
    - 응답 결과로 뷰 이름과 뷰에 전달할 Model 데이터를 포함하는 ModelView 객체를 반환
- **회원 등록 폼**
  ```java
  package hello.servlet.web.frontcontroller.v3.controller;

  public class MemberFormControllerV3 implements ControllerV3 {

      @Override
      public ModelView process(Map<String, String> paramMap) {
          return new ModelView("new-form");
      }
  }
  ```
- **회원 저장**
  ```java
  package hello.servlet.web.frontcontroller.v3.controller;

  public class MemberSaveControllerV3 implements ControllerV3 {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      public ModelView process(Map<String, String> paramMap) {
          String username = paramMap.get("username");
          int age = Integer.parseInt(paramMap.get("age"));

          Member member = new Member(username, age);
          memberRepository.save(member);

          ModelView mv = new ModelView("save-result");
          mv.getModel().put("member", member);
          return mv;
      }
  }
  ```
  - `mv.getModel().put("member", member);`
    - 모델은 단순한 map이므로 모델에 뷰에서 필요한 member 객체를 담고 반환
- **회원 목록**
  ```java
  package hello.servlet.web.frontcontroller.v3.controller;

  public class MemberListControllerV3 implements ControllerV3 {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      public ModelView process(Map<String, String> paramMap) {
          List<Member> members = memberRepository.findAll();
          ModelView mv = new ModelView("members");
          mv.getModel().put("members", members);

          return mv;
      }
  }
  ```
  - paramMap을 사용하지는 않음
- **프론트 컨트롤러V3**
  ```java
  package hello.servlet.web.frontcontroller.v3;

  @WebServlet(name = "frontControllerServletV3", urlPatterns = "/front-controller/v3/*")
  public class FrontControllerServletV3 extends HttpServlet {

      private Map<String, ControllerV3> controllerMap = new HashMap<>();

      public FrontControllerServletV3() {
          controllerMap.put("/front-controller/v3/members/new-form", new MemberFormControllerV3());
          controllerMap.put("/front-controller/v3/members/save", new MemberSaveControllerV3());
          controllerMap.put("/front-controller/v3/members", new MemberListControllerV3());
      }

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

          String requestURI = request.getRequestURI();

          ControllerV3 controller = controllerMap.get(requestURI);
          if (controller == null) {
              response.setStatus(HttpServletResponse.SC_NOT_FOUND );
              return;
          }

          //paramMap
          Map<String, String> paramMap = createParamMap(request);
          ModelView mv = controller.process(paramMap);

          String viewName = mv.getViewName(); // 논리이름 new-form
          MyView view = viewResolver(viewName);
          view.render(mv.getModel(), request, response);
      }

      private MyView viewResolver(String viewName) {
          return new MyView("/WEB-INF/views/" + viewName + ".jsp");
      }

      private Map<String, String> createParamMap(HttpServletRequest request) {
          Map<String, String> paramMap = new HashMap<>();
          request.getParameterNames().asIterator()
                  .forEachRemaining(paramName -> paramMap.put(paramName, request.getParameter(paramName)));
          return paramMap;
      }
  }
  ```
  - 요청 URI를 받아서 알맞은 컨트롤러를 호출
  - 파리미터의 정보와 호출할 뷰의 정보를 가진 ModelView 생성
    - 뷰 이름이 논리 이름이므로 viewResolver를 통해서 원래 ViewPath로 복구
  - 컨트롤러와 모델과 뷰 사이의 코드들인데 중간에 디테일한 코드가 있다면 메서드로 추출
    - `createParamMap`
      - 서블릿에서 파라미터 정보로 Map으로 변환해서 컨트롤러에 전달
- MyView
  ```java
  package hello.servlet.web.frontcontroller;

  public class MyView {
      private String viewPath;

      public MyView(String viewPath) {
          this.viewPath = viewPath;
      }

      public void render(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
          dispatcher.forward(request, response);
      }

      public void render(Map<String, Object> model, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          modelToRequestAttribute(model, request);
          RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
          dispatcher.forward(request, response);
      }

      private static void modelToRequestAttribute(Map<String, Object> model, HttpServletRequest request) {
          model.forEach((key, value) -> request.setAttribute(key, value));
      }
  }

  ```
  - `view.render(mv.getModel(), request, response);`
    - 뷰 객체를 통해서 HTML 화면을 렌더링
      - JSP로 포워드해서 JSP 렌더링
    - 파라미터 정보를 가지고 있는 model도 같이 넘긴다
    - MyView에서는 `modelToRequestAttribute` 메서드를 통해서 request.setAttribute()에 담아둔다
      - JSP는 request.getAttribute()로 데이터를 조회하기 때문이다.

## 단순하고 실용적인 컨트롤러 - v4

- V3 버전도 서블릿 종속성을 제거하고 뷰 경로의 중복을 제거한 좋은 컨트롤러

  - 하지만 개발자 입장에서 항상 ModelView를 생성하고 반환하는 것이 번거로움

- 기본적인 구조는 V3와 같지만 Controller가 ModelVIew가 아니라 ViewName만 반환
- **ControllerV4**
  ```java
  package hello.servlet.web.frontcontroller.v4;

  import java.util.Map;

  public interface ControllerV4 {

      /**
       * @param paramMap
       * @param model
       * @return
       */
      String process(Map<String, String> paramMap, Map<String, Object> model);

  }
  ```
  - model 객체를 프론트 컨트롤러에서 생성해서 파라미터로 전달되기 때문에 다른 컨트롤러에서는 뷰의 이름만 전달
- **MemberFormControllerV4**
  ```java
  package hello.servlet.web.frontcontroller.v4.controller;

  public class MemberFormControllerV4 implements ControllerV4 {

      @Override
      public String process(Map<String, String> paramMap, Map<String, Object> model) {
          return "new-form";
      }
  }
  ```
- **MemberSaveControllerV4**
  ```java
  package hello.servlet.web.frontcontroller.v4.controller;

  public class MemberSaveControllerV4 implements ControllerV4 {
      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      public String process(Map<String, String> paramMap, Map<String, Object> model) {
          String username = paramMap.get("username");
          int age = Integer.parseInt(paramMap.get("age"));

          Member member = new Member(username, age);
          memberRepository.save(member);

          model.put("member", member);
          return "save-result";
      }
  }

  ```
- **MemberListControllerV4**
  ```java
  package hello.servlet.web.frontcontroller.v4.controller;

  public class MemberListControllerV4 implements ControllerV4 {
      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      public String process(Map<String, String> paramMap, Map<String, Object> model) {
          List<Member> members = memberRepository.findAll();

          model.put("members", members);
          return "members";
      }
  }

  ```
  - 전부 모델이 파라미터로 전달되기 때문에 모델을 직접 생성하지 않는다.
    - `model.put("members", members);`
- **FrontControllerServletV4**
  ```java
  package hello.servlet.web.frontcontroller.v4;

  @WebServlet(name = "frontControllerServletV4", urlPatterns = "/front-controller/v4/*")
  public class FrontControllerServletV4 extends HttpServlet {

      private Map<String, ControllerV4> controllerMap = new HashMap<>();

      public FrontControllerServletV4() {
          controllerMap.put("/front-controller/v4/members/new-form", new MemberFormControllerV4());
          controllerMap.put("/front-controller/v4/members/save", new MemberSaveControllerV4());
          controllerMap.put("/front-controller/v4/members", new MemberListControllerV4());
      }

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

          String requestURI = request.getRequestURI();

          ControllerV4 controller = controllerMap.get(requestURI);
          if (controller == null) {
              response.setStatus(HttpServletResponse.SC_NOT_FOUND );
              return;
          }

          //paramMap
          Map<String, String> paramMap = createParamMap(request);
          Map<String, Object> model = new HashMap<>(); //추가

          String viewName = controller.process(paramMap, model);

          MyView view = viewResolver(viewName);
          view.render(model, request, response);
      }

      private MyView viewResolver(String viewName) {
          return new MyView("/WEB-INF/views/" + viewName + ".jsp");
      }

      private Map<String, String> createParamMap(HttpServletRequest request) {
          Map<String, String> paramMap = new HashMap<>();
          request.getParameterNames().asIterator()
                  .forEachRemaining(paramName -> paramMap.put(paramName, request.getParameter(paramName)));
          return paramMap;
      }
  }

  ```
  - 모델 개체 생성 및 전달
    - `Map<String, Object> model = new HashMap<>(); //추가`
- 정리
  - 기존 구조에서 모델을 파라미터로 넘기고 뷰의 논리 이름은 반환한다는 작은 아이디어로 큰 발전이 있었다.
  - 하지만 이런 개선이 한 번에 이루어진 것이 아니라, 프레임워크가 점진적으로 발전하는 과정 속에서 이루어진 것이다.

## 유연한 컨트롤러1 - v5

- 컨트롤러V3와 V4를 유연하게 설정할 수 있도록 리팩토링

### 어댑터 패턴

- 완전히 다른 인터페이스인 두 컨트롤러를 어댑터를 이용해서 선택

  - 마지 110v, 220v를 사용하기 위해 중간에 어댑터를 사용하는 것과 유사

- 핸들러 어댑터
  - 중간에 어댑터 역할을 하는 클래스
  - 다양한 종류의 컨트롤러를 호출 가능하게 함
- 핸들러
  - 이전의 컨트롤러 개념에서 확장한 것으로, 이제 어댑터를 통해서 컨트롤러 이외에도 어떤 종류던 처리할 수 있기 때문이다.
- **MyHandlerAdapter**
  ```java
  package hello.servlet.web.frontcontroller.v5;

  public interface MyHandlerAdapter {

      boolean supports(Object handler);

      ModelView handle(HttpServletRequest request, HttpServletResponse response, Object handler) throws ServletException, IOException;
  }

  ```
  - `boolean supports(Object handler)`
    - 어댑터가 해당 컨트롤러인지 파악하는 메서드
  - `ModelView handle(HttpServletRequest request, HttpServletResponse response, Object handler)`
    - 어댑터는 실제 컨트롤러를 호출하고, 그 결과로 ModelView를 반환
    - 실제 컨트롤러가 ModlView를 반환하지 못하면 어댑터가 생성해서 반환
    - 과거의 프론트 컨트롤러가 하는 기능을 대신함
- **ControllerV3HandlerAdapter**
  ```java
  package hello.servlet.web.frontcontroller.v5.adapter;

  public class ControllerV3HandlerAdapter implements MyHandlerAdapter {
      @Override
      public boolean supports(Object handler) {
          return (handler instanceof ControllerV3);
      }

      @Override
      public ModelView handle(HttpServletRequest request, HttpServletResponse response, Object handler) {
          ControllerV3 controller = (ControllerV3) handler;

          Map<String, String> parmaMap = createParamMap(request);

          ModelView mv = controller.process(parmaMap);
          return mv;
      }

      private Map<String, String> createParamMap(HttpServletRequest request) {
          Map<String, String> paramMap = new HashMap<>();
          request.getParameterNames().asIterator()
                  .forEachRemaining(paramName -> paramMap.put(paramName, request.getParameter(paramName)));
          return paramMap;
      }
  }

  ```
  ```java
  public boolean supports(Object handler) {
          return (handler instanceof ControllerV3);
      }
  ```
  - handler가 ControllerV3인지 확인
  ```java
  ControllerV3 controller = (ControllerV3) handler;
  Map<String, String> parmaMap = createParamMap(request);
  ModelView mv = controller.process(parmaMap);
  return mv;
  ```
  - handler를 컨트롤러 V3로 변환시킨 다음에 V3 형식에 맞도록 호출
- **FrontControllerServletV5**
  ```java
  package hello.servlet.web.frontcontroller.v5;

  @WebServlet(name = "frontControllerServletV5", urlPatterns = "/front-controller/v5/*")
  public class FrontControllerServletV5 extends HttpServlet {

      private final Map<String, Object> handlerMappingMap = new HashMap<>();
      private final List<MyHandlerAdapter> handlerAdapters = new ArrayList<>();

      public FrontControllerServletV5() {
          initHandlerMappingMap();
          initHandlerAdapters();
      }

      private void initHandlerMappingMap() {
          handlerMappingMap.put("/front-controller/v5/v3/members/new-form", new MemberFormControllerV3());
          handlerMappingMap.put("/front-controller/v5/v3/members/save", new MemberSaveControllerV3());
          handlerMappingMap.put("/front-controller/v5/v3/members", new MemberListControllerV3());
      }

      private void initHandlerAdapters() {
          handlerAdapters.add(new ControllerV3HandlerAdapter());
      }

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

          Object handler = getHandler(request);

          if (handler == null) {
              response.setStatus(HttpServletResponse.SC_NOT_FOUND );
              return;
          }

          MyHandlerAdapter adapter = getHandlerAdapter(handler);
          ModelView mv = adapter.handle(request, response, handler);

          MyView view = viewResolver(mv.getViewName());
          view.render(mv.getModel(), request, response);
      }
      private Object getHandler(HttpServletRequest request) {
          String requestURI = request.getRequestURI();
          return handlerMappingMap.get(requestURI);
      }
      private MyHandlerAdapter getHandlerAdapter(Object handler) {
          for (MyHandlerAdapter adapter : handlerAdapters) {
              if (adapter.supports(handler)) {
                  return adapter;
              }
          }
          throw new IllegalArgumentException("handler adapter를 찾을 수 없습니다. handler = " + handler);
      }

      private MyView viewResolver(String viewName) {
          return new MyView("/WEB-INF/views/" + viewName + ".jsp");
      }
  }
  ```
  - 생성자
    ```java
    public FrontControllerServletV5() {
            initHandlerMappingMap(); //핸들러 매핑 초기화
            initHandlerAdapters(); //어댑터 초기화
        }
    ```
  - 매핑 정보
    ```java
    private final Map<String, Object> handlerMappingMap = new HashMap<>();
    ```
    - 컨트롤러 대신 아무 값이나 받을 수 있는 Object로 변경
  - 핸들러를 처리할 수 있는 어댑터 조회
    ```java
    for (MyHandlerAdapter adapter : handlerAdapters) {
    		if (adapter.supports(handler)) {
    				return adapter;
        }
    }
    ```
- 현재는 아직 컨트롤러 V3만 있어서 감흥이 없다

## 유연한 컨트롤러2 - v5

```java
    private void initHandlerMappingMap() {
        handlerMappingMap.put("/front-controller/v5/v3/members/new-form", new MemberFormControllerV3());
        handlerMappingMap.put("/front-controller/v5/v3/members/save", new MemberSaveControllerV3());
        handlerMappingMap.put("/front-controller/v5/v3/members", new MemberListControllerV3());

        // V4 추가
        handlerMappingMap.put("/front-controller/v5/v4/members/new-form", new MemberFormControllerV4());
        handlerMappingMap.put("/front-controller/v5/v4/members/save", new MemberSaveControllerV4());
        handlerMappingMap.put("/front-controller/v5/v4/members", new MemberListControllerV4());

    }

    private void initHandlerAdapters() {
        handlerAdapters.add(new ControllerV3HandlerAdapter());
        handlerAdapters.add(new ControllerV4HandlerAdapter()); //v4 추가
    }
```

- 핸들러 매핑에 컨트롤러v4 추가
- 해당 컨트롤러를 처리할 어댑터 추가

```java
package hello.servlet.web.frontcontroller.v5.adapter;

public class ControllerV4HandlerAdapter implements MyHandlerAdapter {
    @Override
    public boolean supports(Object handler) {
        return (handler instanceof ControllerV4);
    }

    @Override
    public ModelView handle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        ControllerV4 controller = (ControllerV4) handler;

        Map<String, String> parmaMap = createParamMap(request);
        HashMap<String, Object> model = new HashMap<>();

        String viewName = controller.process(parmaMap, model);

        ModelView mv = new ModelView(viewName);
        mv.setModel(model);

        return mv;
    }

    private Map<String, String> createParamMap(HttpServletRequest request) {
        Map<String, String> paramMap = new HashMap<>();
        request.getParameterNames().asIterator()
                .forEachRemaining(paramName -> paramMap.put(paramName, request.getParameter(paramName)));
        return paramMap;
    }
}
```

- 어댑터 변환

```java
ModelView mv = new ModelView(viewName);
mv.setModel(model);
return mv
```

- 컨트롤러v4에서 뷰의 이름만 반환했지만 어댑터에서 이를 ModelView로 만들어서 반환
  - 마치 110v 전기 콘센트를 220v로 변경하듯이
- 다른 부분은 어댑터 v3와 상동

## 정리

- **v1: 프론트 컨트롤러를 도입**
  - 기존 구조를 최대한 유지하면서 프론트 컨트롤러를 도입
- **v2: View 분류**
  - 단순 반복 되는 뷰 로직 분리
- **v3: Model 추가**
  - 서블릿 종속성 제거
  - 뷰 이름 중복 제거
- **v4: 단순하고 실용적인 컨트롤러**
  - v3와 거의 비슷
  - 구현 입장에서 ModelView를 직접 생성해서 반환하지 않도록 편리한 인터페이스 제공
- **v5: 유연한 컨트롤러**
  - 어댑터 도입
  - 어댑터를 추가해서 프레임워크를 유연하고 확장성 있게 설계
- 여기에 애노테이션을 사용해서 컨트롤러를 더 편리하게 발전시킬 수도 있다.
  - 만약 애노테이션을 사용해서 컨트롤러를 편리하게 사용할 수 있게 하려면 어떻게 해야할까?
  - 바로 애노테이션을 지원하는 어댑터를 추가하면 된다.
  - 다형성과 어댑터 덕분에 기존 구조를 유지하면서, 프레임워크의 기능을 확장할 수 있다.
- **스프링 MVC**
  - 현재 코드는 스프링 MVC 프레임워크의 핵심 코드의 축약 버전이고, 구조도 거의 같다.
