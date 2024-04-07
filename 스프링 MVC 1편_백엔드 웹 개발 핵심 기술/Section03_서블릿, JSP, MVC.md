- # Section03\_서블릿, JSP, MVC

## 회원 관리 웹 애플리케이션 요구사항

- **회원 정보**
  - 이름: username
  - 나이: age
- **기능 요구사항**
  - 회원 사항
  - 회원 목록 조회
- **회원 도메인 모델**
  ```java
  package hello.servlet.domain.member;

  import lombok.Getter;
  import lombok.Setter;

  @Getter @Setter
  public class Member {

      private Long id;
      private String username;
      private int age;

      public Member() {
      }

      public Member(String username, int age) {
          this.username = username;
          this.age = age;
      }
  }

  ```
  - id는 Member를 회원 저장소에 저장하면 회원 저장소에서 할당
- **회원 저장소**
  ```java
  package hello.servlet.domain.member;

  import java.util.ArrayList;
  import java.util.HashMap;
  import java.util.List;
  import java.util.Map;

  public class MemberRepository {

      private static Map<Long, Member> store = new HashMap<>();
      private static long sequence = 0L;

      private static final MemberRepository instance = new MemberRepository();

      public static MemberRepository getInstance() {
          return instance;
      }

      private MemberRepository() {
      }

      public Member save(Member member) {
          member.setId(++sequence);
          store.put(member.getId(), member);
          return member;
      }

      public Member findById(Long id) {
          return store.get(id);
      }

      public List<Member> findAll() {
          return new ArrayList<>(store.values());
      }

      public void clearStore() {
          store.clear();
      }
  }

  ```
  - 회원 저장소는 싱글톤 패턴을 적용
    - 스프링을 사용하면 스프링 빈으로 등록하면 자동으로 싱글톤이 되지만 지금은 최대한 스프링 없이 순수 서블릿으로 구현
    - 싱글톤 패턴은 객체를 단 하나만 생성해서 공유해야 하므로 생성자를 private 접근자로 막아둔다.
- 회원 저장소 테스트 코드
  ```java
  package hello.servlet.domain.member;

  class MemberRepositoryTest {

      MemberRepository memberRepository = MemberRepository.getInstance();

      @AfterEach
      void afterEach() {
          memberRepository.clearStore();
      }

      @Test
      void save() {
          //given
          Member member = new Member("hello", 20);

          //when
          Member saveMember = memberRepository.save(member);

          //then
          Member findMember = memberRepository.findById(saveMember.getId());
          assertThat(findMember).isEqualTo(saveMember);
      }
      @Test
      void findAll() {
          //given
          Member member1 = new Member("member1", 20);
          Member member2 = new Member("member2", 30);

          memberRepository.save(member1);
          memberRepository.save(member2);

          //when
          List<Member> result = memberRepository.findAll();

          //then
          assertThat(result.size()).isEqualTo(2);
          assertThat(result).contains(member1, member2);
      }
  }
  ```
  - 회원을 저장하고 목록을 조회하는 테스트 작성
  - 다음 테스트에 영향을 주지 않도록 각 테스트의 저장소를 clearStore()를 호출해서 초기화

## 서블릿으로 회원 관리 웹 애플리케이션 만들기

- MemberFormServlet 회원 등록 폼
  ```java
  package hello.servlet.web.servlet;

  @WebServlet(name = "memberFormServlet", urlPatterns = "/servlet/members/new-form")
  public class MemberFormServlet extends HttpServlet {

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

          response.setContentType("text/html");
          response.setCharacterEncoding("utf-8");

          PrintWriter w = response.getWriter();
          w.write("<!DOCTYPE html>\n" +
                  "<html>\n" +
                  "<head>\n" +
                  "    <meta charset=\"UTF-8\">\n" +
                  "    <title>Title</title>\n" +
                  "</head>\n" +
                  "<body>\n" +
                  "<form action=\"/servlet/members/save\" method=\"post\">\n" +
                  "    username: <input type=\"text\" name=\"username\" />\n" +
                  "    age:      <input type=\"text\" name=\"age\" />\n" +
                  "    <button type=\"submit\">전송</button>\n" +
                  "</form>\n" +
                  "</body>\n" +
                  "</html>\n");
      }
  }

  ```
- MemberSaveServlet - 회원 저장
  ```java
  package hello.servlet.web.servlet;

  @WebServlet(name = "memberSaveServlet", urlPatterns = "/servlet/members/save")
  public class MemberSaveServlet extends HttpServlet {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          System.out.println("MemberSaveServlet.service");
          String username = request.getParameter("username");
          int age = Integer.parseInt(request.getParameter("age"));

          Member member = new Member(username, age);
          memberRepository.save(member);

          response.setContentType("text/html");
          response.setCharacterEncoding("utf-8");

          PrintWriter w = response.getWriter();
          w.write("<html>\n" +
                  "<head>\n" +
                  "    <meta charset=\"UTF-8\">\n" +
                  "</head>\n" +
                  "<body>\n" +
                  "성공\n" +
                  "<ul>\n" +
                  "    <li>id="+member.getId()+"</li>\n" +
                  "    <li>username="+member.getUsername()+"</li>\n" +
                  "    <li>age="+member.getAge()+"</li>\n" +
                  "</ul>\n" +
                  "<a href=\"/index.html\">메인</a>\n" +
                  "</body>\n" +
                  "</html>");
      }
  }

  ```
  - 파라미터 조회해서 Member 객체 생성
  - Member 객체를 MemberRepository를 통해서 저장
  - Member 객체를 사용해서 결과 화면용 HTML을 동적으로 만들어서 응답
- MemberListServlet - 회원 목록
  ```java
  package hello.servlet.web.servlet;

  @WebServlet(name = "memberListServlet", urlPatterns = "/servlet/members")
  public class MemberListServlet extends HttpServlet {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

          List<Member> members = memberRepository.findAll();

          response.setContentType("text/html");
          response.setCharacterEncoding("utf-8");

          PrintWriter w = response.getWriter();
          w.write("<html>");
          w.write("<head>");
          w.write("    <meta charset=\"UTF-8\">");
          w.write("    <title>Title</title>");
          w.write("</head>");
          w.write("<body>");
          w.write("<a href=\"/index.html\">메인</a>");
          w.write("<table>");
          w.write("    <thead>");
          w.write("    <th>id</th>");
          w.write("    <th>username</th>");
          w.write("    <th>age</th>");
          w.write("    </thead>");
          w.write("    <tbody>");

          for (Member member : members) {
              w.write("    <tr>");
              w.write("        <td>" + member.getId() + "</td>");
              w.write("        <td>" + member.getUsername() + "</td>");
              w.write("        <td>" + member.getAge() + "</td>");
              w.write("    </tr>");
          }
          w.write("    </tbody>");
          w.write("</table>");
          w.write("</body>");
          w.write("</html>");
      }
  }
  ```
  - memberRepository.findAll()를 통해 모든 회원 조회
  - 회원 목록 HTML을 for 루프를 통해서 회원 수만큼 동적으로 생성하고 응답

### 템플릿 엔진

- 자바 코드와 서블릿 만으로 동적으로 HTML 생성
  - 하지만 매우 복잡하고 비효율적이다
  - 정적인 HTML 문서에서 동적으로 변경해야 하는 부분만 자바 코드를 넣는 것이 효율적
    - 템플릿 엔진이 나온 이유
- 템플릿 엔진
  - JSP
  - **Thymeleaf(주로 이것을 사용)**
  - Freemarker
  - Velocity

## JSP로 회원 관리 웹 애플리케이션 만들기

- **회원 등록 폼 JSP**
  ```java
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Title</title>
  </head>
  <body>
  <form action="/jsp/members/save.jsp" method="post">
      username: <input type="text" name="username" />
      age:      <input type="text" name="age" />
      <button type="submit">전송</button>
  </form>
  </body>
  </html>
  ```
  - `<%@ page contentType="text/html;charset=UTF-8" language="java" %>`
  - 첫 줄은 JSP 문서라는 의미
  - JSP는 서버 내부에서 서블릿으로 변환되는데,HTML 파일과 거의 같이 작성하면 된다.
- **회원 저장 JSP**
  ```java
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>
  <%@ page import="hello.servlet.domain.member.Member" %>
  <%@ page import="hello.servlet.domain.member.MemberRepository" %>
  <%
      // request, response는 jsp가 서블릿 위에서 작동하는 것으로 import하지 않아도 사용 가능
      MemberRepository memberRepository = MemberRepository.getInstance();
      System.out.println("MemberSaveServlet.service");
      String username = request.getParameter("username");
      int age = Integer.parseInt(request.getParameter("age"));

      Member member = new Member(username, age);
      memberRepository.save(member);
  %>
  <html>
      <head>
          <title>Title</title>
      </head>
      <body>
          성공
          <ul>
              <li>id=<%=member.getId()%></li>
              <li>username=<%=member.getUsername()%></li>
              <li>age=<%=member.getAge()%></li>
          </ul>
      <a href="/index.html">메인</a>
      </body>
  </html>

  ```
  - <% ~~ %>
    - 이 부분에는 자바 코드를 입력할 수 있다.
  - <%= ~~ %>
    - 이 부분에는 자바 코드를 출력할 수 있다.
  - HTML 파일 사이사이에 위의 문법으로 자바 코드를 삽입하였다.
- **회원 목록 JSP**
  ```java
  <%@ page import="hello.servlet.domain.member.Member" %>
  <%@ page import="java.util.List" %>
  <%@ page import="hello.servlet.domain.member.MemberRepository" %>
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>

  <%
      MemberRepository memberRepository = MemberRepository.getInstance();
      List<Member> members = memberRepository.findAll();
  %>

  <html>
  <head>
      <meta charset="UTF-8">
      <title>Title</title>
  </head>
  <body>
  <a href="/index.html">메인</a>
  <table>
      <thead>
      <th>id</th>
      <th>username</th>
      <th>age</th>
      </thead>
      <tbody>
      <%
          for (Member member : members) {
              out.write("    <tr>");
              out.write("        <td>" + member.getId() + "</td>");
              out.write("        <td>" + member.getUsername() + "</td>");
              out.write("        <td>" + member.getAge() + "</td>");
              out.write("    </tr>");
          }
      %>
      </tbody>
  </table>
  </body>
  </html>
  ```

### 서블릿과 JSP의 특징

- 장점
  - 서블릿으로만 작성할 때보다 HTML 부분과 동적으로 변경이 필요한 부분을 깔끔하게 나누어서 작성 가능
- 단점
  - 비즈니스 로직(회원을 저장하기 위한 부분)과 뷰 영역(결과를 HTML로 보여주는 부분)이 전부 JSP에 노출
  - JSP가 너무 많은 역할을 하므로 한 파일에 수백 수천줄이 넘을 수 있다.

### MVC 패턴의 등장

- 비즈니스 로직은 서블릿처럼 다른 곳에서 처리
- JSP는 목적에 맞게 HTML로 화면을 그리는 뷰에 사용

## MVC 패턴 - 개요

### MVC 이전의 문제점

- 너무 많은 역할
  - 하나의 서블릿이나 JSP만으로 비즈니스 로직과 뷰 렌더링을 모두 처리하는 경우
    - 유지보수가 너무 어려워진다
- 변경의 라이프 사이클
  - UI와 비즈니스 로직을 수정하는 주기가 다르고 서로에게 영향을 주지 않는 경우가 다수
  - 이때도 굳이 서로 섞여있는 코드를 관리하는 것은 유지 보수에 좋지 않다
- 기능 특화
  - JSP 같은 뷰 템플릿은 화면을 렌더링 하는데 최적화되어 있어 해당 부분만 맡는 것이 효과적

### Model View Controller

- 컨트롤러
  - HTTP 요청을 받아서 파라미터를 검증하고 비즈니스 로직을 실행
  - 뷰에 전달할 결과 데이터를 조회해서 모델에 담기
  - 참고
    - 컨트롤러에도 비즈니스 로직을 두는 경우도 있지만 일반적으로 서비스 계층을 만들어 따로 처리
- 모델
  - 뷰에 출력할 데이터 담기
    - 뷰는 비즈니스 로직이나 데이터 접근과 무관하게 화면을 렌더링 하는 일에 집중
- 뷰
  - 모델에 담겨있는 데이터를 사용해서 화면을 그리는 일에만 집중

## MVC 패턴 - 적용

- 컨트롤러
  - 서블릿
- 뷰
  - JSP
- 모델
  - 현재는 request 안의 데이터 저장소를 사용
    - request.setAttribute()
    - request.getAttribute()

### 회원 등록

- **회원 등록 폼 - 컨트롤러**
  ```java

  package hello.servlet.web.servletmvc;

  @WebServlet(name = "mvcMemberFormServlet", urlPatterns = "/servlet-mvc/members/new-form")
  public class MvcMemberFormServlet extends HttpServlet {

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          String viewPath = "/WEB-INF/views/new-form.jsp";
          RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
          dispatcher.forward(request, response);

      }
  }

  ```
  - dispatcher.forward()
    - 다른 서블릿이나 JSP로 이동할 수 있는 기능, 서버 내부에서 다시 호출하는 것
  - /WEB-INF
    - 이 경로 안에 JSP가 있으면 외부에서 직접 JSP 호출 불가
    - 컨트롤러를 통해서만 호출하게 하려는 목적 달성
  - redirect vs forward
    - 리다이렉트
      - 실제 클라이언트에 응답
      - 클라이언트에서 다시 redirect 경로에 요청
        - 총 2번 요청
    - 포워드
      - 서버 내부에서 일어나는 호출이기 때문에 클라이언트가 인지 불가
- **회원 등록 폼 - 뷰**
  ```java
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Title</title>
  </head>
  <body>
  <!-- 상대경로 사용, [현재 URL이 속한 계층 경로 + /save] -->
  <form action="save" method="post">
      username: <input type="text" name="username" />
      age:      <input type="text" name="age" />
      <button type="submit">전송</button>
  </form>
  </body>
  </html>
  ```
  - action이 상대경로인 것은 폼 전송시 현재 URL이 속한 계층 경로 + save를 호출
    - 현재 계층 경로: /servlet-mvc/members/
    - 결과: /servlet-mvc/members/save
  - 이후 코드에서 해당 jsp를 계속 사용하기 때문에 상대경로를 사용한 부분을 유지

### 회원 저장

- **회원 저장 - 컨트롤러**
  ```java
  package hello.servlet.web.servletmvc;

  @WebServlet(name = "mvcMemberSaveServlet", urlPatterns = "/servlet-mvc/members/save")
  public class MvcMemberSaveServlet extends HttpServlet {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

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
  - HttpServletRequest를 Model로 사용
    - setAttribute를 사용하여 request에 데이터 보관
    - getAttribute를 사용하여 데이터를 꺼내기
- **회원 저장 - 뷰**
  ```java
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>
  <html>
  <head>
      <title>Title</title>
  </head>
  <body>
  성공
  <ul>
      <li>id=${member.id}</li>
      <li>username=${member.username}</li>
      <li>age=${member.age}</li>
  </ul>
  <a href="/index.html">메인</a>
  </body>
  </html>

  ```
  - `<%= request.getAttribute("member")%>` 를 사용해서 member 객체를 사용할 수 있다
    - JSP에서 제공하는 ${} 문법을 통해 request의 attribute에 담긴 데이터를 쉽게 조회

### 회원 목록 조회

- **회원 목록 조회 - 컨트롤러**
  ```java
  package hello.servlet.web.servletmvc;

  @WebServlet(name = "mvcMemberListServlet", urlPatterns = "/servlet-mvc/members")
  public class MvcMemberListServlet extends HttpServlet {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

          List<Member> members = memberRepository.findAll();

          request.setAttribute("members", members);

          String viewPath = "/WEB-INF/views/members.jsp";
          RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
          dispatcher.forward(request, response);
      }
  }
  ```
  - request 객체를 통해서 `List<Member> members` 를 저장
- **회원 목록 조회 - 뷰**
  ```java
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>
  <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

  <html>
      <head>
          <meta charset="UTF-8">
          <title>Title</title>
      </head>
      <body>
          <a href="/index.html">메인</a>
          <table>
              <thead>
                  <th>id</th>
                  <th>username</th>
                  <th>age</th>
              </thead>
              <tbody>
                  <c:forEach var="item" items="${members}">
                      <tr>
                          <td>${item.id}</td>
                          <td>${item.username}</td>
                          <td>${item.age}</td>
                      </tr>
                  </c:forEach>
              </tbody>
          </table>
      </body>
  </html>
  ```
  - JSP의 taglib 기능을 통해서 반복해서 출력
  - members 리스트에서 member를 순서대로 꺼내서 item 변수에 담고, 출력 반복

## MVC 패턴 - 한계

- 사용하지 않는 코드
  - `HttpServletRequest request, HttpServletResponse response`
    - request, response 코드는 사용할 때도 있고 안 할 때도 있다
  - `HttpServletRequest`, `HttpServletResponse` 두 코드는 테스트 케이스 작성도 어렵다
- 공통 처리가 어렵다
  - 기능이 복잡해질수록 컨트롤러에서 공통으로 처리해야 하는 부분이 증가
  - 포워드 중복
    - view로 이동하는 코드가 항상 중복 호출
    - 공통화해도 메서드를 항상 호출해야 한다
      ```java
      RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
      dispatcher.forward(request, response);
      ```
  - ViewPath 중복
    - `String viewPath = "/WEB-INF/views/new-form.jsp";`
      - prefix: `/WEB-INF/views/`
      - suffix: `.jsp`
    - jsp가 아닌 다른 템플릿 엔진으로 바꾸면 전체 코드를 다 변경해야 한다
- 해결 방법
  - 컨트롤러 호출 전에 공통 기능을 처리(수문장 역할)
  - 프론트 컨트롤러 패턴 도입
    - 스프링 MVC도 프론트 컨트롤러가 핵심# Section03\_서블릿, JSP, MVC

## 회원 관리 웹 애플리케이션 요구사항

- **회원 정보**
  - 이름: username
  - 나이: age
- **기능 요구사항**
  - 회원 사항
  - 회원 목록 조회
- **회원 도메인 모델**
  ```java
  package hello.servlet.domain.member;

  import lombok.Getter;
  import lombok.Setter;

  @Getter @Setter
  public class Member {

      private Long id;
      private String username;
      private int age;

      public Member() {
      }

      public Member(String username, int age) {
          this.username = username;
          this.age = age;
      }
  }

  ```
  - id는 Member를 회원 저장소에 저장하면 회원 저장소에서 할당
- **회원 저장소**
  ```java
  package hello.servlet.domain.member;

  import java.util.ArrayList;
  import java.util.HashMap;
  import java.util.List;
  import java.util.Map;

  public class MemberRepository {

      private static Map<Long, Member> store = new HashMap<>();
      private static long sequence = 0L;

      private static final MemberRepository instance = new MemberRepository();

      public static MemberRepository getInstance() {
          return instance;
      }

      private MemberRepository() {
      }

      public Member save(Member member) {
          member.setId(++sequence);
          store.put(member.getId(), member);
          return member;
      }

      public Member findById(Long id) {
          return store.get(id);
      }

      public List<Member> findAll() {
          return new ArrayList<>(store.values());
      }

      public void clearStore() {
          store.clear();
      }
  }

  ```
  - 회원 저장소는 싱글톤 패턴을 적용
    - 스프링을 사용하면 스프링 빈으로 등록하면 자동으로 싱글톤이 되지만 지금은 최대한 스프링 없이 순수 서블릿으로 구현
    - 싱글톤 패턴은 객체를 단 하나만 생성해서 공유해야 하므로 생성자를 private 접근자로 막아둔다.
- 회원 저장소 테스트 코드
  ```java
  package hello.servlet.domain.member;

  class MemberRepositoryTest {

      MemberRepository memberRepository = MemberRepository.getInstance();

      @AfterEach
      void afterEach() {
          memberRepository.clearStore();
      }

      @Test
      void save() {
          //given
          Member member = new Member("hello", 20);

          //when
          Member saveMember = memberRepository.save(member);

          //then
          Member findMember = memberRepository.findById(saveMember.getId());
          assertThat(findMember).isEqualTo(saveMember);
      }
      @Test
      void findAll() {
          //given
          Member member1 = new Member("member1", 20);
          Member member2 = new Member("member2", 30);

          memberRepository.save(member1);
          memberRepository.save(member2);

          //when
          List<Member> result = memberRepository.findAll();

          //then
          assertThat(result.size()).isEqualTo(2);
          assertThat(result).contains(member1, member2);
      }
  }
  ```
  - 회원을 저장하고 목록을 조회하는 테스트 작성
  - 다음 테스트에 영향을 주지 않도록 각 테스트의 저장소를 clearStore()를 호출해서 초기화

## 서블릿으로 회원 관리 웹 애플리케이션 만들기

- MemberFormServlet 회원 등록 폼
  ```java
  package hello.servlet.web.servlet;

  @WebServlet(name = "memberFormServlet", urlPatterns = "/servlet/members/new-form")
  public class MemberFormServlet extends HttpServlet {

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

          response.setContentType("text/html");
          response.setCharacterEncoding("utf-8");

          PrintWriter w = response.getWriter();
          w.write("<!DOCTYPE html>\n" +
                  "<html>\n" +
                  "<head>\n" +
                  "    <meta charset=\"UTF-8\">\n" +
                  "    <title>Title</title>\n" +
                  "</head>\n" +
                  "<body>\n" +
                  "<form action=\"/servlet/members/save\" method=\"post\">\n" +
                  "    username: <input type=\"text\" name=\"username\" />\n" +
                  "    age:      <input type=\"text\" name=\"age\" />\n" +
                  "    <button type=\"submit\">전송</button>\n" +
                  "</form>\n" +
                  "</body>\n" +
                  "</html>\n");
      }
  }

  ```
- MemberSaveServlet - 회원 저장
  ```java
  package hello.servlet.web.servlet;

  @WebServlet(name = "memberSaveServlet", urlPatterns = "/servlet/members/save")
  public class MemberSaveServlet extends HttpServlet {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          System.out.println("MemberSaveServlet.service");
          String username = request.getParameter("username");
          int age = Integer.parseInt(request.getParameter("age"));

          Member member = new Member(username, age);
          memberRepository.save(member);

          response.setContentType("text/html");
          response.setCharacterEncoding("utf-8");

          PrintWriter w = response.getWriter();
          w.write("<html>\n" +
                  "<head>\n" +
                  "    <meta charset=\"UTF-8\">\n" +
                  "</head>\n" +
                  "<body>\n" +
                  "성공\n" +
                  "<ul>\n" +
                  "    <li>id="+member.getId()+"</li>\n" +
                  "    <li>username="+member.getUsername()+"</li>\n" +
                  "    <li>age="+member.getAge()+"</li>\n" +
                  "</ul>\n" +
                  "<a href=\"/index.html\">메인</a>\n" +
                  "</body>\n" +
                  "</html>");
      }
  }

  ```
  - 파라미터 조회해서 Member 객체 생성
  - Member 객체를 MemberRepository를 통해서 저장
  - Member 객체를 사용해서 결과 화면용 HTML을 동적으로 만들어서 응답
- MemberListServlet - 회원 목록
  ```java
  package hello.servlet.web.servlet;

  @WebServlet(name = "memberListServlet", urlPatterns = "/servlet/members")
  public class MemberListServlet extends HttpServlet {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

          List<Member> members = memberRepository.findAll();

          response.setContentType("text/html");
          response.setCharacterEncoding("utf-8");

          PrintWriter w = response.getWriter();
          w.write("<html>");
          w.write("<head>");
          w.write("    <meta charset=\"UTF-8\">");
          w.write("    <title>Title</title>");
          w.write("</head>");
          w.write("<body>");
          w.write("<a href=\"/index.html\">메인</a>");
          w.write("<table>");
          w.write("    <thead>");
          w.write("    <th>id</th>");
          w.write("    <th>username</th>");
          w.write("    <th>age</th>");
          w.write("    </thead>");
          w.write("    <tbody>");

          for (Member member : members) {
              w.write("    <tr>");
              w.write("        <td>" + member.getId() + "</td>");
              w.write("        <td>" + member.getUsername() + "</td>");
              w.write("        <td>" + member.getAge() + "</td>");
              w.write("    </tr>");
          }
          w.write("    </tbody>");
          w.write("</table>");
          w.write("</body>");
          w.write("</html>");
      }
  }
  ```
  - memberRepository.findAll()를 통해 모든 회원 조회
  - 회원 목록 HTML을 for 루프를 통해서 회원 수만큼 동적으로 생성하고 응답

### 템플릿 엔진

- 자바 코드와 서블릿 만으로 동적으로 HTML 생성
  - 하지만 매우 복잡하고 비효율적이다
  - 정적인 HTML 문서에서 동적으로 변경해야 하는 부분만 자바 코드를 넣는 것이 효율적
    - 템플릿 엔진이 나온 이유
- 템플릿 엔진
  - JSP
  - **Thymeleaf(주로 이것을 사용)**
  - Freemarker
  - Velocity

## JSP로 회원 관리 웹 애플리케이션 만들기

- **회원 등록 폼 JSP**
  ```java
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Title</title>
  </head>
  <body>
  <form action="/jsp/members/save.jsp" method="post">
      username: <input type="text" name="username" />
      age:      <input type="text" name="age" />
      <button type="submit">전송</button>
  </form>
  </body>
  </html>
  ```
  - `<%@ page contentType="text/html;charset=UTF-8" language="java" %>`
  - 첫 줄은 JSP 문서라는 의미
  - JSP는 서버 내부에서 서블릿으로 변환되는데,HTML 파일과 거의 같이 작성하면 된다.
- **회원 저장 JSP**
  ```java
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>
  <%@ page import="hello.servlet.domain.member.Member" %>
  <%@ page import="hello.servlet.domain.member.MemberRepository" %>
  <%
      // request, response는 jsp가 서블릿 위에서 작동하는 것으로 import하지 않아도 사용 가능
      MemberRepository memberRepository = MemberRepository.getInstance();
      System.out.println("MemberSaveServlet.service");
      String username = request.getParameter("username");
      int age = Integer.parseInt(request.getParameter("age"));

      Member member = new Member(username, age);
      memberRepository.save(member);
  %>
  <html>
      <head>
          <title>Title</title>
      </head>
      <body>
          성공
          <ul>
              <li>id=<%=member.getId()%></li>
              <li>username=<%=member.getUsername()%></li>
              <li>age=<%=member.getAge()%></li>
          </ul>
      <a href="/index.html">메인</a>
      </body>
  </html>

  ```
  - <% ~~ %>
    - 이 부분에는 자바 코드를 입력할 수 있다.
  - <%= ~~ %>
    - 이 부분에는 자바 코드를 출력할 수 있다.
  - HTML 파일 사이사이에 위의 문법으로 자바 코드를 삽입하였다.
- **회원 목록 JSP**
  ```java
  <%@ page import="hello.servlet.domain.member.Member" %>
  <%@ page import="java.util.List" %>
  <%@ page import="hello.servlet.domain.member.MemberRepository" %>
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>

  <%
      MemberRepository memberRepository = MemberRepository.getInstance();
      List<Member> members = memberRepository.findAll();
  %>

  <html>
  <head>
      <meta charset="UTF-8">
      <title>Title</title>
  </head>
  <body>
  <a href="/index.html">메인</a>
  <table>
      <thead>
      <th>id</th>
      <th>username</th>
      <th>age</th>
      </thead>
      <tbody>
      <%
          for (Member member : members) {
              out.write("    <tr>");
              out.write("        <td>" + member.getId() + "</td>");
              out.write("        <td>" + member.getUsername() + "</td>");
              out.write("        <td>" + member.getAge() + "</td>");
              out.write("    </tr>");
          }
      %>
      </tbody>
  </table>
  </body>
  </html>
  ```

### 서블릿과 JSP의 특징

- 장점
  - 서블릿으로만 작성할 때보다 HTML 부분과 동적으로 변경이 필요한 부분을 깔끔하게 나누어서 작성 가능
- 단점
  - 비즈니스 로직(회원을 저장하기 위한 부분)과 뷰 영역(결과를 HTML로 보여주는 부분)이 전부 JSP에 노출
  - JSP가 너무 많은 역할을 하므로 한 파일에 수백 수천줄이 넘을 수 있다.

### MVC 패턴의 등장

- 비즈니스 로직은 서블릿처럼 다른 곳에서 처리
- JSP는 목적에 맞게 HTML로 화면을 그리는 뷰에 사용

### MVC 이전의 문제점

- 너무 많은 역할
  - 하나의 서블릿이나 JSP만으로 비즈니스 로직과 뷰 렌더링을 모두 처리하는 경우
    - 유지보수가 너무 어려워진다
- 변경의 라이프 사이클
  - UI와 비즈니스 로직을 수정하는 주기가 다르고 서로에게 영향을 주지 않는 경우가 다수
  - 이때도 굳이 서로 섞여있는 코드를 관리하는 것은 유지 보수에 좋지 않다
- 기능 특화
  - JSP 같은 뷰 템플릿은 화면을 렌더링 하는데 최적화되어 있어 해당 부분만 맡는 것이 효과적

### Model View Controller

- 컨트롤러
  - HTTP 요청을 받아서 파라미터를 검증하고 비즈니스 로직을 실행
  - 뷰에 전달할 결과 데이터를 조회해서 모델에 담기
  - 참고
    - 컨트롤러에도 비즈니스 로직을 두는 경우도 있지만 일반적으로 서비스 계층을 만들어 따로 처리
- 모델
  - 뷰에 출력할 데이터 담기
    - 뷰는 비즈니스 로직이나 데이터 접근과 무관하게 화면을 렌더링 하는 일에 집중
- 뷰
  - 모델에 담겨있는 데이터를 사용해서 화면을 그리는 일에만 집중

## MVC 패턴 - 적용

- 컨트롤러
  - 서블릿
- 뷰
  - JSP
- 모델
  - 현재는 request 안의 데이터 저장소를 사용
    - request.setAttribute()
    - request.getAttribute()

### 회원 등록

- **회원 등록 폼 - 컨트롤러**
  ```java

  package hello.servlet.web.servletmvc;

  @WebServlet(name = "mvcMemberFormServlet", urlPatterns = "/servlet-mvc/members/new-form")
  public class MvcMemberFormServlet extends HttpServlet {

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          String viewPath = "/WEB-INF/views/new-form.jsp";
          RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
          dispatcher.forward(request, response);

      }
  }

  ```
  - dispatcher.forward()
    - 다른 서블릿이나 JSP로 이동할 수 있는 기능, 서버 내부에서 다시 호출하는 것
  - /WEB-INF
    - 이 경로 안에 JSP가 있으면 외부에서 직접 JSP 호출 불가
    - 컨트롤러를 통해서만 호출하게 하려는 목적 달성
  - redirect vs forward
    - 리다이렉트
      - 실제 클라이언트에 응답
      - 클라이언트에서 다시 redirect 경로에 요청
        - 총 2번 요청
    - 포워드
      - 서버 내부에서 일어나는 호출이기 때문에 클라이언트가 인지 불가
- **회원 등록 폼 - 뷰**
  ```java
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Title</title>
  </head>
  <body>
  <!-- 상대경로 사용, [현재 URL이 속한 계층 경로 + /save] -->
  <form action="save" method="post">
      username: <input type="text" name="username" />
      age:      <input type="text" name="age" />
      <button type="submit">전송</button>
  </form>
  </body>
  </html>
  ```
  - action이 상대경로인 것은 폼 전송시 현재 URL이 속한 계층 경로 + save를 호출
    - 현재 계층 경로: /servlet-mvc/members/
    - 결과: /servlet-mvc/members/save
  - 이후 코드에서 해당 jsp를 계속 사용하기 때문에 상대경로를 사용한 부분을 유지

### 회원 저장

- **회원 저장 - 컨트롤러**
  ```java
  package hello.servlet.web.servletmvc;

  @WebServlet(name = "mvcMemberSaveServlet", urlPatterns = "/servlet-mvc/members/save")
  public class MvcMemberSaveServlet extends HttpServlet {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

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
  - HttpServletRequest를 Model로 사용
    - setAttribute를 사용하여 request에 데이터 보관
    - getAttribute를 사용하여 데이터를 꺼내기
- **회원 저장 - 뷰**
  ```java
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>
  <html>
  <head>
      <title>Title</title>
  </head>
  <body>
  성공
  <ul>
      <li>id=${member.id}</li>
      <li>username=${member.username}</li>
      <li>age=${member.age}</li>
  </ul>
  <a href="/index.html">메인</a>
  </body>
  </html>

  ```
  - `<%= request.getAttribute("member")%>` 를 사용해서 member 객체를 사용할 수 있다
    - JSP에서 제공하는 ${} 문법을 통해 request의 attribute에 담긴 데이터를 쉽게 조회

### 회원 목록 조회

- **회원 목록 조회 - 컨트롤러**
  ```java
  package hello.servlet.web.servletmvc;

  @WebServlet(name = "mvcMemberListServlet", urlPatterns = "/servlet-mvc/members")
  public class MvcMemberListServlet extends HttpServlet {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

          List<Member> members = memberRepository.findAll();

          request.setAttribute("members", members);

          String viewPath = "/WEB-INF/views/members.jsp";
          RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
          dispatcher.forward(request, response);
      }
  }
  ```
  - request 객체를 통해서 `List<Member> members` 를 저장
- **회원 목록 조회 - 뷰**
  ```java
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>
  <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

  <html>
      <head>
          <meta charset="UTF-8">
          <title>Title</title>
      </head>
      <body>
          <a href="/index.html">메인</a>
          <table>
              <thead>
                  <th>id</th>
                  <th>username</th>
                  <th>age</th>
              </thead>
              <tbody>
                  <c:forEach var="item" items="${members}">
                      <tr>
                          <td>${item.id}</td>
                          <td>${item.username}</td>
                          <td>${item.age}</td>
                      </tr>
                  </c:forEach>
              </tbody>
          </table>
      </body>
  </html>
  ```
  - JSP의 taglib 기능을 통해서 반복해서 출력
  - members 리스트에서 member를 순서대로 꺼내서 item 변수에 담고, 출력 반복

## MVC 패턴 - 한계

- 사용하지 않는 코드
  - `HttpServletRequest request, HttpServletResponse response`
    - request, response 코드는 사용할 때도 있고 안 할 때도 있다
  - `HttpServletRequest`, `HttpServletResponse` 두 코드는 테스트 케이스 작성도 어렵다
- 공통 처리가 어렵다
  - 기능이 복잡해질수록 컨트롤러에서 공통으로 처리해야 하는 부분이 증가
  - 포워드 중복
    - view로 이동하는 코드가 항상 중복 호출
    - 공통화해도 메서드를 항상 호출해야 한다
      ```java
      RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
      dispatcher.forward(request, response);
      ```
  - ViewPath 중복
    - `String viewPath = "/WEB-INF/views/new-form.jsp";`
      - prefix: `/WEB-INF/views/`
      - suffix: `.jsp`
    - jsp가 아닌 다른 템플릿 엔진으로 바꾸면 전체 코드를 다 변경해야 한다
- 해결 방법
  - 컨트롤러 호출 전에 공통 기능을 처리(수문장 역할)
  - 프론트 컨트롤러 패턴 도입
    - 스프링 MVC도 프론트 컨트롤러가 핵심
  - 회원 사항
  - 회원 목록 조회
- **회원 도메인 모델**
  ```java
  package hello.servlet.domain.member;

  import lombok.Getter;
  import lombok.Setter;

  @Getter @Setter
  public class Member {

      private Long id;
      private String username;
      private int age;

      public Member() {
      }

      public Member(String username, int age) {
          this.username = username;
          this.age = age;
      }
  }

  ```
  - id는 Member를 회원 저장소에 저장하면 회원 저장소에서 할당
- **회원 저장소**
  ```java
  package hello.servlet.domain.member;

  import java.util.ArrayList;
  import java.util.HashMap;
  import java.util.List;
  import java.util.Map;

  public class MemberRepository {

      private static Map<Long, Member> store = new HashMap<>();
      private static long sequence = 0L;

      private static final MemberRepository instance = new MemberRepository();

      public static MemberRepository getInstance() {
          return instance;
      }

      private MemberRepository() {
      }

      public Member save(Member member) {
          member.setId(++sequence);
          store.put(member.getId(), member);
          return member;
      }

      public Member findById(Long id) {
          return store.get(id);
      }

      public List<Member> findAll() {
          return new ArrayList<>(store.values());
      }

      public void clearStore() {
          store.clear();
      }
  }

  ```
  - 회원 저장소는 싱글톤 패턴을 적용
    - 스프링을 사용하면 스프링 빈으로 등록하면 자동으로 싱글톤이 되지만 지금은 최대한 스프링 없이 순수 서블릿으로 구현
    - 싱글톤 패턴은 객체를 단 하나만 생성해서 공유해야 하므로 생성자를 private 접근자로 막아둔다.
- 회원 저장소 테스트 코드
  ```java
  package hello.servlet.domain.member;

  class MemberRepositoryTest {

      MemberRepository memberRepository = MemberRepository.getInstance();

      @AfterEach
      void afterEach() {
          memberRepository.clearStore();
      }

      @Test
      void save() {
          //given
          Member member = new Member("hello", 20);

          //when
          Member saveMember = memberRepository.save(member);

          //then
          Member findMember = memberRepository.findById(saveMember.getId());
          assertThat(findMember).isEqualTo(saveMember);
      }
      @Test
      void findAll() {
          //given
          Member member1 = new Member("member1", 20);
          Member member2 = new Member("member2", 30);

          memberRepository.save(member1);
          memberRepository.save(member2);

          //when
          List<Member> result = memberRepository.findAll();

          //then
          assertThat(result.size()).isEqualTo(2);
          assertThat(result).contains(member1, member2);
      }
  }
  ```
  - 회원을 저장하고 목록을 조회하는 테스트 작성
  - 다음 테스트에 영향을 주지 않도록 각 테스트의 저장소를 clearStore()를 호출해서 초기화

## 서블릿으로 회원 관리 웹 애플리케이션 만들기

- MemberFormServlet 회원 등록 폼
  ```java
  package hello.servlet.web.servlet;

  @WebServlet(name = "memberFormServlet", urlPatterns = "/servlet/members/new-form")
  public class MemberFormServlet extends HttpServlet {

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

          response.setContentType("text/html");
          response.setCharacterEncoding("utf-8");

          PrintWriter w = response.getWriter();
          w.write("<!DOCTYPE html>\n" +
                  "<html>\n" +
                  "<head>\n" +
                  "    <meta charset=\"UTF-8\">\n" +
                  "    <title>Title</title>\n" +
                  "</head>\n" +
                  "<body>\n" +
                  "<form action=\"/servlet/members/save\" method=\"post\">\n" +
                  "    username: <input type=\"text\" name=\"username\" />\n" +
                  "    age:      <input type=\"text\" name=\"age\" />\n" +
                  "    <button type=\"submit\">전송</button>\n" +
                  "</form>\n" +
                  "</body>\n" +
                  "</html>\n");
      }
  }

  ```
- MemberSaveServlet - 회원 저장
  ```java
  package hello.servlet.web.servlet;

  @WebServlet(name = "memberSaveServlet", urlPatterns = "/servlet/members/save")
  public class MemberSaveServlet extends HttpServlet {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          System.out.println("MemberSaveServlet.service");
          String username = request.getParameter("username");
          int age = Integer.parseInt(request.getParameter("age"));

          Member member = new Member(username, age);
          memberRepository.save(member);

          response.setContentType("text/html");
          response.setCharacterEncoding("utf-8");

          PrintWriter w = response.getWriter();
          w.write("<html>\n" +
                  "<head>\n" +
                  "    <meta charset=\"UTF-8\">\n" +
                  "</head>\n" +
                  "<body>\n" +
                  "성공\n" +
                  "<ul>\n" +
                  "    <li>id="+member.getId()+"</li>\n" +
                  "    <li>username="+member.getUsername()+"</li>\n" +
                  "    <li>age="+member.getAge()+"</li>\n" +
                  "</ul>\n" +
                  "<a href=\"/index.html\">메인</a>\n" +
                  "</body>\n" +
                  "</html>");
      }
  }

  ```
  - 파라미터 조회해서 Member 객체 생성
  - Member 객체를 MemberRepository를 통해서 저장
  - Member 객체를 사용해서 결과 화면용 HTML을 동적으로 만들어서 응답
- MemberListServlet - 회원 목록
  ```java
  package hello.servlet.web.servlet;

  @WebServlet(name = "memberListServlet", urlPatterns = "/servlet/members")
  public class MemberListServlet extends HttpServlet {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

          List<Member> members = memberRepository.findAll();

          response.setContentType("text/html");
          response.setCharacterEncoding("utf-8");

          PrintWriter w = response.getWriter();
          w.write("<html>");
          w.write("<head>");
          w.write("    <meta charset=\"UTF-8\">");
          w.write("    <title>Title</title>");
          w.write("</head>");
          w.write("<body>");
          w.write("<a href=\"/index.html\">메인</a>");
          w.write("<table>");
          w.write("    <thead>");
          w.write("    <th>id</th>");
          w.write("    <th>username</th>");
          w.write("    <th>age</th>");
          w.write("    </thead>");
          w.write("    <tbody>");

          for (Member member : members) {
              w.write("    <tr>");
              w.write("        <td>" + member.getId() + "</td>");
              w.write("        <td>" + member.getUsername() + "</td>");
              w.write("        <td>" + member.getAge() + "</td>");
              w.write("    </tr>");
          }
          w.write("    </tbody>");
          w.write("</table>");
          w.write("</body>");
          w.write("</html>");
      }
  }
  ```
  - memberRepository.findAll()를 통해 모든 회원 조회
  - 회원 목록 HTML을 for 루프를 통해서 회원 수만큼 동적으로 생성하고 응답

### 템플릿 엔진

- 자바 코드와 서블릿 만으로 동적으로 HTML 생성
  - 하지만 매우 복잡하고 비효율적이다
  - 정적인 HTML 문서에서 동적으로 변경해야 하는 부분만 자바 코드를 넣는 것이 효율적
    - 템플릿 엔진이 나온 이유
- 템플릿 엔진
  - JSP
  - **Thymeleaf(주로 이것을 사용)**
  - Freemarker
  - Velocity

## JSP로 회원 관리 웹 애플리케이션 만들기

- **회원 등록 폼 JSP**
  ```java
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Title</title>
  </head>
  <body>
  <form action="/jsp/members/save.jsp" method="post">
      username: <input type="text" name="username" />
      age:      <input type="text" name="age" />
      <button type="submit">전송</button>
  </form>
  </body>
  </html>
  ```
  - `<%@ page contentType="text/html;charset=UTF-8" language="java" %>`
  - 첫 줄은 JSP 문서라는 의미
  - JSP는 서버 내부에서 서블릿으로 변환되는데,HTML 파일과 거의 같이 작성하면 된다.
- **회원 저장 JSP**
  ```java
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>
  <%@ page import="hello.servlet.domain.member.Member" %>
  <%@ page import="hello.servlet.domain.member.MemberRepository" %>
  <%
      // request, response는 jsp가 서블릿 위에서 작동하는 것으로 import하지 않아도 사용 가능
      MemberRepository memberRepository = MemberRepository.getInstance();
      System.out.println("MemberSaveServlet.service");
      String username = request.getParameter("username");
      int age = Integer.parseInt(request.getParameter("age"));

      Member member = new Member(username, age);
      memberRepository.save(member);
  %>
  <html>
      <head>
          <title>Title</title>
      </head>
      <body>
          성공
          <ul>
              <li>id=<%=member.getId()%></li>
              <li>username=<%=member.getUsername()%></li>
              <li>age=<%=member.getAge()%></li>
          </ul>
      <a href="/index.html">메인</a>
      </body>
  </html>

  ```
  - <% ~~ %>
    - 이 부분에는 자바 코드를 입력할 수 있다.
  - <%= ~~ %>
    - 이 부분에는 자바 코드를 출력할 수 있다.
  - HTML 파일 사이사이에 위의 문법으로 자바 코드를 삽입하였다.
- **회원 목록 JSP**
  ```java
  <%@ page import="hello.servlet.domain.member.Member" %>
  <%@ page import="java.util.List" %>
  <%@ page import="hello.servlet.domain.member.MemberRepository" %>
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>

  <%
      MemberRepository memberRepository = MemberRepository.getInstance();
      List<Member> members = memberRepository.findAll();
  %>

  <html>
  <head>
      <meta charset="UTF-8">
      <title>Title</title>
  </head>
  <body>
  <a href="/index.html">메인</a>
  <table>
      <thead>
      <th>id</th>
      <th>username</th>
      <th>age</th>
      </thead>
      <tbody>
      <%
          for (Member member : members) {
              out.write("    <tr>");
              out.write("        <td>" + member.getId() + "</td>");
              out.write("        <td>" + member.getUsername() + "</td>");
              out.write("        <td>" + member.getAge() + "</td>");
              out.write("    </tr>");
          }
      %>
      </tbody>
  </table>
  </body>
  </html>
  ```

### 서블릿과 JSP의 특징

- 장점
  - 서블릿으로만 작성할 때보다 HTML 부분과 동적으로 변경이 필요한 부분을 깔끔하게 나누어서 작성 가능
- 단점
  - 비즈니스 로직(회원을 저장하기 위한 부분)과 뷰 영역(결과를 HTML로 보여주는 부분)이 전부 JSP에 노출
  - JSP가 너무 많은 역할을 하므로 한 파일에 수백 수천줄이 넘을 수 있다.

### MVC 패턴의 등장

- 비즈니스 로직은 서블릿처럼 다른 곳에서 처리
- JSP는 목적에 맞게 HTML로 화면을 그리는 뷰에 사용

## MVC 패턴 - 개요

### MVC 이전의 문제점

- 너무 많은 역할
  - 하나의 서블릿이나 JSP만으로 비즈니스 로직과 뷰 렌더링을 모두 처리하는 경우
    - 유지보수가 너무 어려워진다
- 변경의 라이프 사이클
  - UI와 비즈니스 로직을 수정하는 주기가 다르고 서로에게 영향을 주지 않는 경우가 다수
  - 이때도 굳이 서로 섞여있는 코드를 관리하는 것은 유지 보수에 좋지 않다
- 기능 특화
  - JSP 같은 뷰 템플릿은 화면을 렌더링 하는데 최적화되어 있어 해당 부분만 맡는 것이 효과적

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/0aaf4a74-921a-401b-8ef7-79a743f1e4df/1a64401a-9aef-4231-85e3-efc75171004b/Untitled.png)

### Model View Controller

- 컨트롤러
  - HTTP 요청을 받아서 파라미터를 검증하고 비즈니스 로직을 실행
  - 뷰에 전달할 결과 데이터를 조회해서 모델에 담기
  - 참고
    - 컨트롤러에도 비즈니스 로직을 두는 경우도 있지만 일반적으로 서비스 계층을 만들어 따로 처리
- 모델
  - 뷰에 출력할 데이터 담기
    - 뷰는 비즈니스 로직이나 데이터 접근과 무관하게 화면을 렌더링 하는 일에 집중
- 뷰
  - 모델에 담겨있는 데이터를 사용해서 화면을 그리는 일에만 집중

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/0aaf4a74-921a-401b-8ef7-79a743f1e4df/c87db8e9-ab76-45e8-9494-4564a8355bc5/Untitled.png)

## MVC 패턴 - 적용

- 컨트롤러
  - 서블릿
- 뷰
  - JSP
- 모델
  - 현재는 request 안의 데이터 저장소를 사용
    - request.setAttribute()
    - request.getAttribute()

### 회원 등록

- **회원 등록 폼 - 컨트롤러**
  ```java

  package hello.servlet.web.servletmvc;

  @WebServlet(name = "mvcMemberFormServlet", urlPatterns = "/servlet-mvc/members/new-form")
  public class MvcMemberFormServlet extends HttpServlet {

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          String viewPath = "/WEB-INF/views/new-form.jsp";
          RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
          dispatcher.forward(request, response);

      }
  }

  ```
  - dispatcher.forward()
    - 다른 서블릿이나 JSP로 이동할 수 있는 기능, 서버 내부에서 다시 호출하는 것
  - /WEB-INF
    - 이 경로 안에 JSP가 있으면 외부에서 직접 JSP 호출 불가
    - 컨트롤러를 통해서만 호출하게 하려는 목적 달성
  - redirect vs forward
    - 리다이렉트
      - 실제 클라이언트에 응답
      - 클라이언트에서 다시 redirect 경로에 요청
        - 총 2번 요청
    - 포워드
      - 서버 내부에서 일어나는 호출이기 때문에 클라이언트가 인지 불가
- **회원 등록 폼 - 뷰**
  ```java
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Title</title>
  </head>
  <body>
  <!-- 상대경로 사용, [현재 URL이 속한 계층 경로 + /save] -->
  <form action="save" method="post">
      username: <input type="text" name="username" />
      age:      <input type="text" name="age" />
      <button type="submit">전송</button>
  </form>
  </body>
  </html>
  ```
  - action이 상대경로인 것은 폼 전송시 현재 URL이 속한 계층 경로 + save를 호출
    - 현재 계층 경로: /servlet-mvc/members/
    - 결과: /servlet-mvc/members/save
  - 이후 코드에서 해당 jsp를 계속 사용하기 때문에 상대경로를 사용한 부분을 유지

### 회원 저장

- **회원 저장 - 컨트롤러**
  ```java
  package hello.servlet.web.servletmvc;

  @WebServlet(name = "mvcMemberSaveServlet", urlPatterns = "/servlet-mvc/members/save")
  public class MvcMemberSaveServlet extends HttpServlet {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

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
  - HttpServletRequest를 Model로 사용
    - setAttribute를 사용하여 request에 데이터 보관
    - getAttribute를 사용하여 데이터를 꺼내기
- **회원 저장 - 뷰**
  ```java
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>
  <html>
  <head>
      <title>Title</title>
  </head>
  <body>
  성공
  <ul>
      <li>id=${member.id}</li>
      <li>username=${member.username}</li>
      <li>age=${member.age}</li>
  </ul>
  <a href="/index.html">메인</a>
  </body>
  </html>

  ```
  - `<%= request.getAttribute("member")%>` 를 사용해서 member 객체를 사용할 수 있다
    - JSP에서 제공하는 ${} 문법을 통해 request의 attribute에 담긴 데이터를 쉽게 조회

### 회원 목록 조회

- **회원 목록 조회 - 컨트롤러**
  ```java
  package hello.servlet.web.servletmvc;

  @WebServlet(name = "mvcMemberListServlet", urlPatterns = "/servlet-mvc/members")
  public class MvcMemberListServlet extends HttpServlet {

      private MemberRepository memberRepository = MemberRepository.getInstance();

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

          List<Member> members = memberRepository.findAll();

          request.setAttribute("members", members);

          String viewPath = "/WEB-INF/views/members.jsp";
          RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
          dispatcher.forward(request, response);
      }
  }
  ```
  - request 객체를 통해서 `List<Member> members` 를 저장
- **회원 목록 조회 - 뷰**
  ```java
  <%@ page contentType="text/html;charset=UTF-8" language="java" %>
  <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

  <html>
      <head>
          <meta charset="UTF-8">
          <title>Title</title>
      </head>
      <body>
          <a href="/index.html">메인</a>
          <table>
              <thead>
                  <th>id</th>
                  <th>username</th>
                  <th>age</th>
              </thead>
              <tbody>
                  <c:forEach var="item" items="${members}">
                      <tr>
                          <td>${item.id}</td>
                          <td>${item.username}</td>
                          <td>${item.age}</td>
                      </tr>
                  </c:forEach>
              </tbody>
          </table>
      </body>
  </html>
  ```
  - JSP의 taglib 기능을 통해서 반복해서 출력
  - members 리스트에서 member를 순서대로 꺼내서 item 변수에 담고, 출력 반복

## MVC 패턴 - 한계

- 사용하지 않는 코드
  - `HttpServletRequest request, HttpServletResponse response`
    - request, response 코드는 사용할 때도 있고 안 할 때도 있다
  - `HttpServletRequest`, `HttpServletResponse` 두 코드는 테스트 케이스 작성도 어렵다
- 공통 처리가 어렵다
  - 기능이 복잡해질수록 컨트롤러에서 공통으로 처리해야 하는 부분이 증가
  - 포워드 중복
    - view로 이동하는 코드가 항상 중복 호출
    - 공통화해도 메서드를 항상 호출해야 한다
      ```java
      RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
      dispatcher.forward(request, response);
      ```
  - ViewPath 중복
    - `String viewPath = "/WEB-INF/views/new-form.jsp";`
      - prefix: `/WEB-INF/views/`
      - suffix: `.jsp`
    - jsp가 아닌 다른 템플릿 엔진으로 바꾸면 전체 코드를 다 변경해야 한다
- 해결 방법
  - 컨트롤러 호출 전에 공통 기능을 처리(수문장 역할)
  - 프론트 컨트롤러 패턴 도입
    - 스프링 MVC도 프론트 컨트롤러가 핵심
