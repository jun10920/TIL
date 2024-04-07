# Section02\_서블릿

## Hello 서블릿

> 👻 스프링 부트 없이 톰캣 같은 WAS를 설치하고 서블릿 코드를 클래스 파일로 빌드해서 올린다음 톰캣 서버를 실행해도 서블릿을 등록할 수 있다.
> 하지만 매우 번거롭고 현재 사용하지 않으므로 스프링 부트를 이용해서 서블릿 코드를 실행한다.

### 스프링 부트 서블릿 환경 구성

- @ServletComponentScan
  - 스프링 부트는 서블릿을 직접 등록해서 사용할 수 있게 서블릿 스캔 애노테이션을 제공
  ```java
  @ServletComponentScan // 서블릿 자동 등록
  @SpringBootApplication
  public class ServletApplication {

  	public static void main(String[] args) {
  		SpringApplication.run(ServletApplication.class, args);
  	}
  }
  ```
- 서블릿 등록
  ```java
  package hello.servlet.basic;

  @WebServlet(name = "helloServlet", urlPatterns = "/hello")
  public class HelloServlet extends HttpServlet {

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          System.out.println("HelloServlet.service");
          System.out.println("request = " + request);
          System.out.println("response = " + response);

          String username = request.getParameter("username");
          System.out.println("username = " + username);

          response.setContentType("text/plain");
          response.setCharacterEncoding("utf-8");
          response.getWriter().write("hello " + username);
      }
  }
  ```
  - @WebServlet 서블릿 애노테이션
    - name: 서블릿 이름
    - urlPartterns: URL 매핑
    - HTTP 요청을 통해 매핑된 URL이 호출되면 서블릿 컨테이너는 service 메서드를 실행

### HTTP 요청 메시지 로그로 확인하기

[application.properties](http://application.properties) 파일에 아래 코드 추가

```java
logging.level.org.apache.coyote.http11=debug
```

- 그럼 HTTP 요청 메시지를 서버 로그에 출력
  - 운영서버에 이렇게 모든 요청 정보를 다 남기면 성능 저하가 일어나므로 개발 단계에서만 사용

## HttpServletRequest - 개요

- 서블릿은 개발자가 HTTP 요청 메시지를 파싱해서 HttpServletRequest 객체에 담아서 제공
  - START LINE
    - HTTP 메소드
    - URL
    - 쿼리 스트링
    - 스키마, 프로토콜
  - 헤더
    - 헤더 조회
  - 바디
    - form 파라미터 형식 조회
    - message body 데이터 직접 조회
- 부가적인 기능
  - 임시 저장소 기능
    - 해당 HTTP 요청이 시작부터 끝날 때까지 유지되는 임시 저장소 기능
      - 저장
        - request.setAttribute(name, value)
      - 조회
        - request.getAttribute(name)
  - 세션 관리 기능
    - request.getSesstion(create: true)

## HttpServletRequest - 기본 사용법

- 아래와 같은 함수들로
  - 스타트 라인
  - 헤더 정보
  - 기타 정보
- 들을 조회할 수 있다.
- 자세한 코드는 김영한님도 복붙 하는 거 보면 중요하진 않는듯

```java
@WebServlet(name = "requestHeaderServlet", urlPatterns = "/request-header")
public class RequestHeaderServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        printStartLine(request);
        printHeaders(request);
        printHeaderUtils(request);
        printEtc(request);
    }
```

## HTTP 요청 데이터 - 개요

- HTTP 요청 메시지를 통해 클라이언트에서 서버로 데이터 전달하는 방법
- GET - 쿼리 파라미터
  - 메시지 바디 없이, URL의 쿼리 파라미터에 데이터를 포함해서 전달
  - 예) 검색, 필터, 페이징 등에서 많이 사용하는 방식
- POST - HTML Form
  - 메시지 바디에 쿼리 파라미터 형식으로 전달
  - 예) 회원 가입, 상품 주문, HTML Form 사용
- HTTP message body에 데이터를 직접 담아서 요청
  - HTTP API에서 주로 사용, JSON, XML, TEXT
- 데이터 형식은 주로 JSON 사용
  - POST, PUT, PATCH

## HTTP 요청 데이터 - GET 쿼리 파라미터

- 전달 데이터
  - username=hello
  - age=20
- 아래와 같은 URL로 쿼리
- http://localhost:8080/request-param?username=hello&age=20&username=hello2
- 쿼리 파라미터 조회 메서드

```java
// 전체 파라미터 조회
 request.getParameterNames().asIterator()
                        .forEachRemaining(paramName -> System.out.println(paramName +  "=" + request.getParameter(paramName)));

// 단일 파라미터 조회
System.out.println("[단일 파라미터 조회]");
        String username = request.getParameter("username");
        String age = request.getParameter("age");

        System.out.println("username = " + username);
        System.out.println("age = " + age);
        System.out.println();

// 이름이 같은 파라미터 조회 (복수 파라미터)
System.out.println("[이름이 같은 복수 파라미터 조회]");
        String[] usernames = request.getParameterValues("username");
        for (String name : usernames) {
            System.out.println("username = " + name);
        }
```

- 복수 파라미터에서 단일 파라미터 조회
  - 복수 파라미터의 첫 번째 값을 반환

## HTTP 요청 데이터 - POST HTML Form

### 특징

- **content-type:** application/x-www-form-urlencoded
- 메시지 바디에 쿼리 파라미터 형식으로 데이터 전달
- POST의 HTML Form을 전송하면 웹 브라우저는 다음 형식으로 HTTP 메시지를 생성
- 메시지 바디의 쿼리 파라미터 형식이 GET 쿼리 파라미터와 동일
- 그래서 쿼리 파라미터 조회 메서드도 동일

### 차이점

- GET URL 쿼리 파라미터 방식
  - HTTP 메시지 바디 x → content-type x
- POST HTML Form 방식
  - HTTP 메시지 바디 o → content type o

### Postman을 사용한 테스트

- POST 전송시
  - Body → x-www-form-urlencoded
  - content-type: application/x-www-form-urlencoded

## HTTP 요청 데이터 - API 메시지 바디 - 단순 텍스트

- HTTP message body에 데이터를 직접 담아서 요청
  - HTTP API에서 주로 사용, **JSON**, XML, TEXT
  - POST, PUT, PATCH

```java
@WebServlet(name = "requestBodyStringServlet", urlPatterns = "/request-body-string")
public class RequestBodyStringServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ServletInputStream inputStream = request.getInputStream();
        String messageBody = StreamUtils.copyToString((inputStream), StandardCharsets.UTF_8);

        System.out.println("messageBody = " + messageBody);
        response.getWriter().write("ok");
    }
}
```

- inputStream은 byte 코드를 반환
- byte 코드를 우리가 있을 수 있는 문자로 보기 위해 문자표(Charset)을 지정

## HTTP 요청 데이터 - API 메시지 바디 - JSON

### JSON 형식 파싱 추가

```java
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class HelloData {

    private String username;
    private int age;
}
```

- 롬복 라이브러리가 Getter, Setter 자동 생성

### HTTP 요청 데이터 JSON 형식으로 API 메시지 받기

```java
@WebServlet(name = "requestBodyJsonServlet", urlPatterns = "/request-body-json")
public class RequestBodyJsonServlet extends HttpServlet {

    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ServletInputStream inputStream = request.getInputStream();
        String messageBody = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);

        System.out.println("messageBody = " + messageBody);

        HelloData helloData = objectMapper.readValue(messageBody, HelloData.class);

        System.out.println("helloData.getUsername() = " + helloData.getUsername());
        System.out.println("helloData.age() = " + helloData.getAge());

        response.getWriter().write("ok");

    }
}
```

- JSON 결과를 파싱해서 사용할 수 있는 자바 객체로 변환하려면 Jackson, Gson 같은 변환 라이브러리를 추가해서 사용해야 한다.
  - 스프링 MVC는 기본으로 Jackson 라이브러리의 ObjectMapper 제공

## HttpServletResponse - 기본 사용법

### HttpServletResponse 역할

- HTTP 응답 메시지 생성
  - HTTP 응답 코드 지정
  - 헤더 생성
  - 바디 생성
- 편의 기능 제공
  - Content-Type, 쿠키, Redirect

### HttpServletResponse 기본 사용법

```java
@WebServlet(name ="responseHeaderServlet", urlPatterns = "/response-header")
public class ResponseHeaderServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //[status-line]
        response.setStatus(HttpServletResponse.SC_OK); // 200

        //[response-headers]
//        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("my-header", "hello");

        //[Header 편의 메서드]
        //content(response);
        //cookie(response);
        redirect(response);

        //[message body]
        PrintWriter writer = response.getWriter();
        writer.println("ok");
    }
```

- 위 기본 메서드를 사용하기 쉽게 만든 편의 메서드
  - Content 편의 메서드
  ```java
  private void content(HttpServletResponse response) {
          //Content-Type: text/plain;charset=utf-8
          //Content-Length: 2
          //response.setHeader("Content-Type", "text/plain;charset=utf-8");
          response.setContentType("text/plain");
          response.setCharacterEncoding("utf-8");
          //response.setContentLength(2); //(생략시 자동 생성)
      }
  ```
  - 쿠키 편의 메서드
  ```java
  private void cookie(HttpServletResponse response) {
          //Set-Cookie: myCookie=good; Max-Age=600;
          //response.setHeader("Set-Cookie", "myCookie=good; Max-Age=600");
          Cookie cookie = new Cookie("myCookie", "good");
          cookie.setMaxAge(600); //600초
          response.addCookie(cookie);
      }
  ```
  - redirect 편의 메서드
  ```java
      private void redirect(HttpServletResponse response) throws IOException {
          //Status Code 302
          //Location: /basic/hello-form.html
          //response.setStatus(HttpServletResponse.SC_FOUND); //302
          //response.setHeader("Location", "/basic/hello-form.html");
          response.sendRedirect("/basic/hello-form.html");
      }
  ```

## HTTP 응답 데이터 - 단순 텍스트, HTML

- 단순 텍스트 응답
  - writer.println(”ok”);
  - HTML 응답
  - HTTP API - MessageBody JSON 응답

```java
package hello.servlet.basic.reqponse;

@WebServlet(name= "responseHtmlServlet", urlPatterns = "/response-html")
public class ResponseHtmlServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        response.setContentType(("text/html"));
        response.setCharacterEncoding("utf-8");

        PrintWriter writer = response.getWriter();
        writer.println("<html>");
        writer.println("<body>");
        writer.println("  <div>안녕?</div>");
        writer.println("</body>");
        writer.println("</html>");
    }
}
```

- HTTP 응답으로 HTML을 반환할 때는 content-type을 text/html로 지정

## HTTP 응답 데이터 - API JSON

```java
package hello.servlet.basic.reqponse;

@WebServlet(name = "responseJsonServlet", urlPatterns = "/response-json")
public class ResponseJsonServlet extends HttpServlet {

    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("utf-8");

        HelloData helloData = new HelloData();
        helloData.setUsername("kim");
        helloData.setAge(20);

        String result = objectMapper.writeValueAsString(helloData);
        response.getWriter().write(result);
    }
}

```

- JSON으로 반환할 떄는 content-type을 application/json으로 지정
- Jackson 라이브러리의 objectMapper.writeValueAsString() 메서드를 통해서 객체를 JSON 문자로 변경
  ```java
  @ServletComponentScan // 서블릿 자동 등록
  @SpringBootApplication
  public class ServletApplication {

  	public static void main(String[] args) {
  		SpringApplication.run(ServletApplication.class, args);
  	}
  }
  ```
- 서블릿 등록
  ```java
  package hello.servlet.basic;

  @WebServlet(name = "helloServlet", urlPatterns = "/hello")
  public class HelloServlet extends HttpServlet {

      @Override
      protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
          System.out.println("HelloServlet.service");
          System.out.println("request = " + request);
          System.out.println("response = " + response);

          String username = request.getParameter("username");
          System.out.println("username = " + username);

          response.setContentType("text/plain");
          response.setCharacterEncoding("utf-8");
          response.getWriter().write("hello " + username);
      }
  }
  ```
  - @WebServlet 서블릿 애노테이션
    - name: 서블릿 이름
    - urlPartterns: URL 매핑
    - HTTP 요청을 통해 매핑된 URL이 호출되면 서블릿 컨테이너는 service 메서드를 실행

### HTTP 요청 메시지 로그로 확인하기

[application.properties](http://application.properties) 파일에 아래 코드 추가

```java
logging.level.org.apache.coyote.http11=debug
```

- 그럼 HTTP 요청 메시지를 서버 로그에 출력
  - 운영서버에 이렇게 모든 요청 정보를 다 남기면 성능 저하가 일어나므로 개발 단계에서만 사용

### 서블릿 컨테이너 동작 방식 설명

- 내장 톰캣 서버
  ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/0aaf4a74-921a-401b-8ef7-79a743f1e4df/9e387ea0-20ed-4cf2-8b20-09f6285fae3e/Untitled.png)
- HTTP 요청, HTTP 응답 메시지
  ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/0aaf4a74-921a-401b-8ef7-79a743f1e4df/0c1e05d4-28e6-4d7a-8b29-c803d641e759/Untitled.png)
- 웹 애플리케이션 서버의 요청 응답 구조
  ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/0aaf4a74-921a-401b-8ef7-79a743f1e4df/7590ce1f-edfa-461d-ac38-7ccb90754b7c/Untitled.png)

## HttpServletRequest - 개요

- 서블릿은 개발자가 HTTP 요청 메시지를 파싱해서 HttpServletRequest 객체에 담아서 제공
  - START LINE
    - HTTP 메소드
    - URL
    - 쿼리 스트링
    - 스키마, 프로토콜
  - 헤더
    - 헤더 조회
  - 바디
    - form 파라미터 형식 조회
    - message body 데이터 직접 조회
- 부가적인 기능
  - 임시 저장소 기능
    - 해당 HTTP 요청이 시작부터 끝날 때까지 유지되는 임시 저장소 기능
      - 저장
        - request.setAttribute(name, value)
      - 조회
        - request.getAttribute(name)
  - 세션 관리 기능
    - request.getSesstion(create: true)

## HttpServletRequest - 기본 사용법

- 아래와 같은 함수들로
  - 스타트 라인
  - 헤더 정보
  - 기타 정보
- 들을 조회할 수 있다.
- 자세한 코드는 김영한님도 복붙 하는 거 보면 중요하진 않는듯

```java
@WebServlet(name = "requestHeaderServlet", urlPatterns = "/request-header")
public class RequestHeaderServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        printStartLine(request);
        printHeaders(request);
        printHeaderUtils(request);
        printEtc(request);
    }
```

## HTTP 요청 데이터 - 개요

- HTTP 요청 메시지를 통해 클라이언트에서 서버로 데이터 전달하는 방법
- GET - 쿼리 파라미터
  - 메시지 바디 없이, URL의 쿼리 파라미터에 데이터를 포함해서 전달
  - 예) 검색, 필터, 페이징 등에서 많이 사용하는 방식
- POST - HTML Form
  - 메시지 바디에 쿼리 파라미터 형식으로 전달
  - 예) 회원 가입, 상품 주문, HTML Form 사용
- HTTP message body에 데이터를 직접 담아서 요청
  - HTTP API에서 주로 사용, JSON, XML, TEXT
- 데이터 형식은 주로 JSON 사용
  - POST, PUT, PATCH

## HTTP 요청 데이터 - GET 쿼리 파라미터

- 전달 데이터
  - username=hello
  - age=20
- 아래와 같은 URL로 쿼리
- http://localhost:8080/request-param?username=hello&age=20&username=hello2
- 쿼리 파라미터 조회 메서드

```java
// 전체 파라미터 조회
 request.getParameterNames().asIterator()
                        .forEachRemaining(paramName -> System.out.println(paramName +  "=" + request.getParameter(paramName)));

// 단일 파라미터 조회
System.out.println("[단일 파라미터 조회]");
        String username = request.getParameter("username");
        String age = request.getParameter("age");

        System.out.println("username = " + username);
        System.out.println("age = " + age);
        System.out.println();

// 이름이 같은 파라미터 조회 (복수 파라미터)
System.out.println("[이름이 같은 복수 파라미터 조회]");
        String[] usernames = request.getParameterValues("username");
        for (String name : usernames) {
            System.out.println("username = " + name);
        }
```

- 복수 파라미터에서 단일 파라미터 조회
  - 복수 파라미터의 첫 번째 값을 반환

## HTTP 요청 데이터 - POST HTML Form

### 특징

- **content-type:** application/x-www-form-urlencoded
- 메시지 바디에 쿼리 파라미터 형식으로 데이터 전달
- POST의 HTML Form을 전송하면 웹 브라우저는 다음 형식으로 HTTP 메시지를 생성
- 메시지 바디의 쿼리 파라미터 형식이 GET 쿼리 파라미터와 동일
- 그래서 쿼리 파라미터 조회 메서드도 동일

### 차이점

- GET URL 쿼리 파라미터 방식
  - HTTP 메시지 바디 x → content-type x
- POST HTML Form 방식
  - HTTP 메시지 바디 o → content type o

### Postman을 사용한 테스트

- POST 전송시
  - Body → x-www-form-urlencoded
  - content-type: application/x-www-form-urlencoded

## HTTP 요청 데이터 - API 메시지 바디 - 단순 텍스트

- HTTP message body에 데이터를 직접 담아서 요청
  - HTTP API에서 주로 사용, **JSON**, XML, TEXT
  - POST, PUT, PATCH

```java
@WebServlet(name = "requestBodyStringServlet", urlPatterns = "/request-body-string")
public class RequestBodyStringServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ServletInputStream inputStream = request.getInputStream();
        String messageBody = StreamUtils.copyToString((inputStream), StandardCharsets.UTF_8);

        System.out.println("messageBody = " + messageBody);
        response.getWriter().write("ok");
    }
}
```

- inputStream은 byte 코드를 반환
- byte 코드를 우리가 있을 수 있는 문자로 보기 위해 문자표(Charset)을 지정

## HTTP 요청 데이터 - API 메시지 바디 - JSON

### JSON 형식 파싱 추가

```java
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class HelloData {

    private String username;
    private int age;
}
```

- 롬복 라이브러리가 Getter, Setter 자동 생성

### HTTP 요청 데이터 JSON 형식으로 API 메시지 받기

```java
@WebServlet(name = "requestBodyJsonServlet", urlPatterns = "/request-body-json")
public class RequestBodyJsonServlet extends HttpServlet {

    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ServletInputStream inputStream = request.getInputStream();
        String messageBody = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);

        System.out.println("messageBody = " + messageBody);

        HelloData helloData = objectMapper.readValue(messageBody, HelloData.class);

        System.out.println("helloData.getUsername() = " + helloData.getUsername());
        System.out.println("helloData.age() = " + helloData.getAge());

        response.getWriter().write("ok");

    }
}
```

- JSON 결과를 파싱해서 사용할 수 있는 자바 객체로 변환하려면 Jackson, Gson 같은 변환 라이브러리를 추가해서 사용해야 한다.
  - 스프링 MVC는 기본으로 Jackson 라이브러리의 ObjectMapper 제공

## HttpServletResponse - 기본 사용법

### HttpServletResponse 역할

- HTTP 응답 메시지 생성
  - HTTP 응답 코드 지정
  - 헤더 생성
  - 바디 생성
- 편의 기능 제공
  - Content-Type, 쿠키, Redirect

### HttpServletResponse 기본 사용법

```java
@WebServlet(name ="responseHeaderServlet", urlPatterns = "/response-header")
public class ResponseHeaderServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //[status-line]
        response.setStatus(HttpServletResponse.SC_OK); // 200

        //[response-headers]
//        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("my-header", "hello");

        //[Header 편의 메서드]
        //content(response);
        //cookie(response);
        redirect(response);

        //[message body]
        PrintWriter writer = response.getWriter();
        writer.println("ok");
    }
```

- 위 기본 메서드를 사용하기 쉽게 만든 편의 메서드
  - Content 편의 메서드
  ```java
  private void content(HttpServletResponse response) {
          //Content-Type: text/plain;charset=utf-8
          //Content-Length: 2
          //response.setHeader("Content-Type", "text/plain;charset=utf-8");
          response.setContentType("text/plain");
          response.setCharacterEncoding("utf-8");
          //response.setContentLength(2); //(생략시 자동 생성)
      }
  ```
  - 쿠키 편의 메서드
  ```java
  private void cookie(HttpServletResponse response) {
          //Set-Cookie: myCookie=good; Max-Age=600;
          //response.setHeader("Set-Cookie", "myCookie=good; Max-Age=600");
          Cookie cookie = new Cookie("myCookie", "good");
          cookie.setMaxAge(600); //600초
          response.addCookie(cookie);
      }
  ```
  - redirect 편의 메서드
  ```java
      private void redirect(HttpServletResponse response) throws IOException {
          //Status Code 302
          //Location: /basic/hello-form.html
          //response.setStatus(HttpServletResponse.SC_FOUND); //302
          //response.setHeader("Location", "/basic/hello-form.html");
          response.sendRedirect("/basic/hello-form.html");
      }
  ```

## HTTP 응답 데이터 - 단순 텍스트, HTML

- 단순 텍스트 응답
  - writer.println(”ok”);
  - HTML 응답
  - HTTP API - MessageBody JSON 응답

```java
package hello.servlet.basic.reqponse;

@WebServlet(name= "responseHtmlServlet", urlPatterns = "/response-html")
public class ResponseHtmlServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        response.setContentType(("text/html"));
        response.setCharacterEncoding("utf-8");

        PrintWriter writer = response.getWriter();
        writer.println("<html>");
        writer.println("<body>");
        writer.println("  <div>안녕?</div>");
        writer.println("</body>");
        writer.println("</html>");
    }
}
```

- HTTP 응답으로 HTML을 반환할 때는 content-type을 text/html로 지정

## HTTP 응답 데이터 - API JSON

```java
package hello.servlet.basic.reqponse;

@WebServlet(name = "responseJsonServlet", urlPatterns = "/response-json")
public class ResponseJsonServlet extends HttpServlet {

    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("utf-8");

        HelloData helloData = new HelloData();
        helloData.setUsername("kim");
        helloData.setAge(20);

        String result = objectMapper.writeValueAsString(helloData);
        response.getWriter().write(result);
    }
}

```

- JSON으로 반환할 떄는 content-type을 application/json으로 지정
- Jackson 라이브러리의 objectMapper.writeValueAsString() 메서드를 통해서 객체를 JSON 문자로 변경
