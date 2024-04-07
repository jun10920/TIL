# Section06\_스프링MVC - 기본 기능

## 프로젝트 생성

---

- War는 상대적으로 Jar에 비해 기능이 많다
  - 그래서 외장 서버를 따로 사용하고, jsp를 사용할 때 사용한다
  - 하지만 요즘은 대부분 Jar를 사용한다

## 로깅 간단히 알아보기

- 실제 운영에서는 `System.out.println()` 를 사용하지 않고 별도의 로깅 라이브러리를 사용

### 로깅 라이브러리

- 스프링 부트 라이브러리에 스프링 부트 로깅 라이브러리가 포함
  - SLF4J - [http://www.slf4j.org](http://www.slf4j.org/)
    - Logback, Log4J, Log4J2의 인터페이스
  - Logback - [http://logback.qos.ch](http://logback.qos.ch/)
- 실무에서는 SLF4J를 인터페이스로 선택하고 그 구현체로 Logback을 사용

### 로그 선언

- private Logger log = LoggerFactory.getLogger(getClass());
- private static final Logger log = LoggerFactory.getLogger(Xxx.class)
- @Slf4j : 롬복 사용 가능

### 로그 호출

- [log.info](http://log.info/)("hello")
- System.out.println("hello")
- 예시 코드
  ```java
  package hello.springmvc.basic;

  //@Slf4j
  @RestController
  public class LogTestController {

      private final Logger log = LoggerFactory.getLogger(getClass());

      @RequestMapping("/log-test")
      public String logTest() {
          String name = "Spring";

          log.trace(" trace log={}", name);
          log.debug(" debug log={}", name);
          log.info("  info log={}", name);
          log.warn("  warn log={}", name);
          log.error(" error log={}", name);

          return "ok";
      }
  }
  ```
  - 매핑 정보
    - `@Controller`
      - @Controller는 반환 값이 String이면 뷰 이름으로 인식
      - 그래서 뷰를 찾고 뷰가 렌더링
    - `@RestController`
      - HTTP 메시지 바디에 바로 String을 입력
  - 테스트
    - 로그가 출려되는 포멧
      - 시간, 로그 레벨, 프로세스 ID, .쓰레드 명, 클래스 명, 로그 메시지
    - 로그 레벨 설정
      - LEVEL: TRACE > DEBUG > INFO > WARN > ERROR
      - 개발 서버는 DEBUG
      - 운영 서버는 info
  - 로그 레벨 설정
    ```java
    #전체 로그 레벨 설정(기본 info)
    logging.level.root=info

    #hello.springmvc 패키지와 그 하위 로그 레벨 설정
    logging.level.hello.springmvc=debu
    ```
  - 올바른 로그 사용법
    - log.debug(”data=” + data)
      - 로그 출력 레벨을 info로 설정해도 해당 코드의 연산이 실행되고 거른다
      - 쓸데없는 리소스 낭비
    - log.debug(”data={}, data)
      - 로그 출력 레벨을 info로 설정하면 아무 일도 발생하지 않는다.
- 로그 사용시 장점
  - 쓰레드 정보, 클래스 이름 같은 부가 정보를 볼 수 있고, 출력 모양을 조정 가능
  - 로그 레벨에 맞춰서 서버마다 상황에 맞게 조정 가능하다
  - 시스템 아웃 콘솔, 파일, 네트워크 등 위치를 조정할 수 있다.
  - 성능도 System.out보다 월등히 좋다
    - 내부 버퍼링, 멀티 쓰레드
- 추가 정보
- 로그에 대해서 더 자세한 내용은 slf4j, logback을 검색해보자.
  - SLF4J - [http://www.slf4j.org](http://www.slf4j.org/)
  - Logback - [http://logback.qos.ch](http://logback.qos.ch/)
- 스프링 부트가 제공하는 로그 기능은 다음을 참고하자.
  - [https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-logging](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#boot-features-logging)

## 요청 매핑

### MappingController

```java
package hello.springmvc.basic.requestmapping;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

@RestController
public class MappingController {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @RequestMapping("/hello-basic")
    public String helloBasic() {
        log.info("helloBasic");
        return "ok";
    }
}
```

- `@RequestMapping("/hello-basic")` 에서 속성을 배열로 제공하므로 다중 설정 가능
  - `{"/hello-basic", "/hello-go"}`
- HTTP 메서드 매핑
  ```java
  /**
   * method 특정 HTTP 메서드 요청만 허용
   * GET, HEAD, POST, PUT, PATCH, DELETE
   */
  @RequestMapping(value = "/mapping-get-v1", method = RequestMethod.GET)
  public String mappingGetV1() {
      log.info("mappingGetV1");
  return "ok";
  }
  ```
  - HTTP 메서드 매핑 축약
    ```java
    /**
     * 편리한 축약 애노테이션 (코드보기)
     * @GetMapping
     * @PostMapping
     * @PutMapping
     * @DeleteMapping
     * @PatchMapping
     */
    @GetMapping(value = "/mapping-get-v2")
    public String mappingGetV2() {
        log.info("mapping-get-v2");
    return "ok";
    }
    ```
- PathVariable(경로 변수) 사용
  ```java
  /**
   * PathVariable 사용
   * 변수명이 같으면 생략 가능
   * @PathVariable("userId") String userId -> @PathVariable String userId
   */
  @GetMapping("/mapping/{userId}")
  public String mappingPath(@PathVariable("userId") String data) {
      log.info("mappingPath userId={}", data);
  return "ok";
  }
  ```
  - 최근 HTTP API는 리소스 경로에 식별자를 넣는 스타일 선호
  - @RequestMapping이 URL 경로를 템플릿화
  - @PathVariavle 이 매칭 되는 부분을 편리하게 조회
    - 이름과 파라미터가 같으면 생략 가능
- PathVariable 사용 - 다중
  ```java
  /**
   * PathVariable 사용 다중
   */
  @GetMapping("/mapping/users/{userId}/orders/{orderId}")
  public String mappingPath(@PathVariable String userId, @PathVariable Long
  orderId) {
      log.info("mappingPath userId={}, orderId={}", userId, orderId);
  return "ok";
  }
  ```
- 특정 파라미터 조건 매핑
  ```java
  /**
   * 파라미터로 추가 매핑
   * params="mode",
   * params="!mode"
   * params="mode=debug"
   * params="mode!=debug" (! = )
   * params = {"mode=debug","data=good"}
   */
  @GetMapping(value = "/mapping-param", params = "mode=debug")
  public String mappingParam() {
      log.info("mappingParam");
  return "ok";
  }
  ```
  - 특정 파라미터가 있거나 없는 조건을 추가 가능
  - 자주 사용 x
- 특정 헤더 조건 매핑
  ```java
  /**
   * 특정 헤더로 추가 매핑
   * headers="mode",
   * headers="!mode"
   * headers="mode=debug"
   * headers="mode!=debug" (! = )
   */
  @GetMapping(value = "/mapping-header", headers = "mode=debug")
  public String mappingHeader() {
      log.info("mappingHeader");
  return "ok";
  }
  ```
- 미디어 타입 조건 매핑(Content-Type, consume)
  ```java
  /**
   * Content-Type 헤더 기반 추가 매핑 Media Type
   * consumes="application/json"
   * consumes="!application/json"
   * consumes="application/*"
   * consumes="*\/*"
   * MediaType.APPLICATION_JSON_VALUE
   */
  @PostMapping(value = "/mapping-consume", consumes = "application/json")
  public String mappingConsumes() {
      log.info("mappingConsumes");
  return "ok";
  }
  ```
  - Content-Type 헤더를 기반으로 미디어 타입을 매핑
  - 맞지 않으면 HTTP 415 상태코드(Unsupported Media Type) 반환
- 미디어 타입 조건 매핑(HTTP 요청 Accept, produce)
  ```java
  /**
   * Accept 헤더 기반 Media Type
   * produces = "text/html"
   * produces = "!text/html"
   * produces = "text/*"
   * produces = "*\/*"
   */
  @PostMapping(value = "/mapping-produce", produces = "text/html")public String mappingProduces() {
      log.info("mappingProduces");
  return "ok";
  }
  ```
  - Accept 헤더를 기반으로 미디어 타입 매핑
  - 맞지 않으면 406 상태코드(Not Acceptable) 반환

## 요청 매핑 - API 예시

**회원 관리 API**

회원 목록 조회: GET /users
회원 등록: POST /users
회원 조회: GET /users/{userId}
회원 수정: PATCH /users/{userId}
회원 삭제: DELETE /users/{userId}

**MappingClassController**

```java
package hello.springmvc.basic.requestmapping;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/mapping/users")
public class MappingClassController {

    @GetMapping
    public String user() {
        return "get users";
    }

    @PostMapping
    public String addUser() {
        return "post user";
    }

    @GetMapping("/{userId}")
    public String findUser(@PathVariable String userId) {
        return "get userId = " + userId;
    }

    @PatchMapping("/{userId}")
    public String updateUser(@PathVariable String userId) {
        return "update userId = " + userId;
    }

    @DeleteMapping("/{userId}")
    public String deleteUser(@PathVariable String userId) {
        return "delete userId = " + userId;
    }

}

```

- @RequestMapping(”/mapping/users”)
  - 클래스 레벨에 매핑 정보를 두면 메서드 레벨에서 해당 정보를 조합해서 사용

## HTTP 요청 - 기본, 헤더 조회

- RequestHeaderController
  ```java
  package hello.springmvc.basic.request;

  @Slf4j
  @RestController
  public class RequestHeaderController {

      @RequestMapping("/headers")
      public String headers(HttpServletRequest request,
                            HttpServletResponse response,
                            HttpMethod httpMethod,
                            Locale locale,
                            @RequestHeader MultiValueMap<String, String> headerMap,
                            @RequestHeader("host") String host,
                            @CookieValue(value = "myCookie", required = false) String cookie) {

          log.info("request={}", request);
          log.info("response={}", response);
          log.info("httpMethod={}", httpMethod);
          log.info("locale={}", locale);
          log.info("headerMap={}", headerMap);
          log.info("header host={}", host);
          log.info("myCookie={}", cookie);

          return "ok";
      }
  }
  ```
- HttpServletRequest
- HttpServletResponse
- HttpMethod : HTTP 메서드를 조회한다. org.springframework.http.HttpMethod
- Locale : Locale 정보를 조회한다.
- @RequestHeader MultiValueMap<String, String> headerMap
  - 모든 HTTP 헤더를 MultiValueMap 형식으로 조회한다.
- @RequestHeader("host") String host
  - 특정 HTTP 헤더를 조회한다.
  - 속성
    - 필수 값 여부: required
    - 기본 값 속성: defaultValue
- @CookieValue(value = "myCookie", required = false) String cookie
  - 특정 쿠키를 조회한다.
  - 속성
    - 필수 값 여부: required
    - 기본 값: defaultValue
- MultiValueMap
  - MAP과 유사한데 하나의 키에 여러 값을 받을 수 있다
  - HTTP header, HTTP 쿼리 파라미터와 같이 하나의 키에 여러 값을 받을 때 사용
    - keyA=value1&keyA=value2]
- 참고
  - @Controller 의 사용 가능한 파라미터 목록은 다음 공식 메뉴얼에서 확인할 수 있다.
    - [https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-ann-arguments](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/arguments.html)

## HTTP 요청 파라미터 - 쿼리 파라미터, HTML Form

- 클라이언트에서 서버로 요청 데이터를 전달할 때는 주로 다음 3가지 방법을 사용한다.
  - GET - 쿼리 파라미터
    - /url**?username=hello&age=20**
    - 메시지 바디 없이, URL의 쿼리 파라미터에 데이터를 포함해서 전달
    - 예) 검색, 필터, 페이징등에서 많이 사용하는 방식
  - POST - HTML Form
    - content-type: application/x-www-form-urlencoded
    - 메시지 바디에 쿼리 파리미터 형식으로 전달 username=hello&age=20
    - 예) 회원 가입, 상품 주문, HTML Form 사용
  - HTTP message body에 데이터를 직접 담아서 요청
    - HTTP API에서 주로 사용, JSON, XML, TEXT
    - 데이터 형식은 주로 JSON 사용
    - POST, PUT, PATCH

### 요청 파라미터 - 쿼리 파라미터, HTML Form

- 둘 다 형식이 같으므로 구분 없이 **요청 파라미터 조회**로 가능
- RequestParamController
  ```java
  package hello.springmvc.basic.request;

  @Slf4j
  @Controller
  public class RequestParamController {

      @RequestMapping("/request-param-v1")
      public void requestParamV1(HttpServletRequest request, HttpServletResponse response) throws IOException {
          String username = request.getParameter("username");
          int age = Integer.parseInt(request.getParameter("age"));
          log.info("username={}, age={}", username, age);

          response.getWriter().write("ok");
      }
  }
  ```
  - `request.getParameter()`
    - HttpServletRequest가 제공하는 방식으로 요청 파라미터 조회
- **Post Form 페이지 생성**
  - 리소스는 /resources/static 아래에 두면 스프링 부트가 자동으로 인식
  - Jar를 사용하면 webapp 경로를 사용할 수 없음
  - 정적 리소스도 클래스 경로에 함께 포함해야 함

## HTTP 요청 파라미터 - @ReqeustParam

**requestParamV2**

````java
/**
```java * @RequestParam 사용
 * - 파라미터 이름으로 바인딩
 * @ResponseBody 추가
 * - View 조회를 무시하고, HTTP message body에 직접 해당 내용 입력
 */
@ResponseBody
@RequestMapping("/request-param-v2")
public String requestParamV2(
        @RequestParam("username") String memberName,
        @RequestParam("age") int memberAge) {
    log.info("username={}, age={}", memberName, memberAge);
return "ok";
}
````

- @RequestParam: 파라미터 이름으로 바인딩
- @ResponseBody: View 조회를 무시하고 HTTP 메시지 바디에 직접 해당 내용 입력

**requestParamV3**

```java
/**
 * @RequestParam 사용
 * HTTP 파라미터 이름이 변수 이름과 같으면 @RequestParam(name="xx") 생략 가능
 */
@ResponseBody
@RequestMapping("/request-param-v3")
public String requestParamV3(
        @RequestParam String username,
        @RequestParam int age) {
    log.info("username={}, age={}", username, age);
return "ok";
}
```

- HTTP 파라미터 이름이 변수 이름과 같으면 @RequestParam(name="xx") 생략 가능

**requestParamV4**

```java
/**
 * @RequestParam 사용
 * String, int 등의 단순 타입이면 @RequestParam 도 생략 가능
 */
@ResponseBody
@RequestMapping("/request-param-v4")
public String requestParamV4(String username, int age) {
    log.info("username={}, age={}", username, age);
return "ok";
}
```

- String, int, Integer 등의 단순 타입이면 `@RequestParam` 생략 가능
  - `@RequestParam` 애노테이션을 생략하면 스프링 mvc는 내부에서 `required=false` 를 적용
  - 스프링 부트 3.2부터는 -parameters 옵션을 사용하지 않으면 생략 불가능

**파라미터 필수 여부 - requestParamRequired**

```java
/**
 * @RequestParam.required
 * /request-param-required -> username이 없으므로 예외
 *
 * 주의!
 * /request-param-required?username= -> 빈문자로 통과
 *
 * 주의!
 * /request-param-required
 * int age -> null을 int에 입력하는 것은 불가능, 따라서 Integer 변경해야 함(또는 다음에 나오는
defaultValue 사용)
 */
@ResponseBody
@RequestMapping("/request-param-required")
public String requestParamRequired(
        @RequestParam(required = true) String username,
        @RequestParam(required = false) Integer age) {
    log.info("username={}, age={}", username, age);
return "ok";
}
```

- `@RequestParam(required = true)`
  - 파라미터 필수 여부
  - 기본값이 파라미터 필수(true)이다
  - 주의
    - 파라미터 이름만 있고 값이 없는 경우
      - `/request-param-required?username=`
        - 빈 문자로 통과
    - 기본형에 null 입력
      - `@RequestParam(required = false) int age`
        - null을 받을 수 있는 `Interger`로 변경하거나 `defaultValue`를 사용

**기본 값 적용 - requestParamDefault**

```java
/**
 * @RequestParam
 * - defaultValue 사용
 *
 * 참고: defaultValue는 빈 문자의 경우에도 적용
 * /request-param-default?username=
 */
@ResponseBody
@RequestMapping("/request-param-default")
public String requestParamDefault(
        @RequestParam(required = true, defaultValue = "guest") String username,
        @RequestParam(required = false, defaultValue = "-1") int age) {
    log.info("username={}, age={}", username, age);
return "ok";
}
```

- 파라미터에 값이 없는 경우 defautlValue를 사용하면 기본 값 사용 가능
  - 기본 값이 있으므로 required 옵션은 필요가 없음
  - 빈 문자의 경우에도 설정한 기본 값이 적용

**파라미터를 Map으로 조회하기 - requestParamMap**

```java
/**
 * @RequestParam Map, MultiValueMap
 * Map(key=value)
 * MultiValueMap(key=[value1, value2, ...]) ex) (key=userIds, value=[id1, id2])
 */
@ResponseBody
@RequestMapping("/request-param-map")
public String requestParamMap(@RequestParam Map<String, Object> paramMap) {
    log.info("username={}, age={}", paramMap.get("username"),
paramMap.get("age"));
return "ok";
}
```

- `@RequestParam Map`
  - `Map(key=value)`
- `@RequestParam MultiValueMap`
  - `MultiValueMap(key=[value1, value2, ...]`
    - `ex) (key=userIds, value=[id1,id2])`
- 파라미터의 값이 하나라면 Map을 사용해도 되지만 아니라면 MultiValueMap 사용
- 하지만 파라미터는 대부분 중복 없이 하나만 사용한다

## HTTP 요청 파라미터 - @ModelAttribute

```java
@RequestParam String username;
@RequestParam int age;
HelloData data = new HelloData();
data.setUsername(username);
javadata.setAge(age)
```

- 요청 파라미터에 필요한 객체를 생성
- 객체에 값을 대입
  - 스프링에는 이 과정을 자동화해주는 @ModelAttribute 기능 제공

**HelloData**

```java
package hello.springmvc.basic;

import lombok.Data;

@Data
public class HelloData {
	private String username;
	private int age;
}
```

- 룸복 @Data
  - @Getter , @Setter , @ToString , @EqualsAndHashCode , @RequiredArgsConstructor 를
    자동으로 적용

**@ModelAttribute 적용 - modelAttributeV1**

```java
/**
 * @ModelAttribute 사용
 * 참고: model.addAttribute(helloData) 코드도 함께 자동 적용됨, 뒤에 model을 설명할 때 자세히
설명
 */
@ResponseBody
@RequestMapping("/model-attribute-v1")
public String modelAttributeV1(@ModelAttribute HelloData helloData) {
    log.info("username={}, age={}", helloData.getUsername(),
		helloData.getAge());
		return "ok";
}
```

- HelloData 객체가 자동 생성되고 요청 파라미터 값도 자동 주입
- 스프링 MVC에서 @ModelAttribute의 동작 방식
  - HelloData 객체 생성
  - 요청 파라미터의 이름으로 HelloData 객체의 프로퍼티 검색
  - 해당 프로퍼티의 setter를 호출해서 파라미터의 값을 바인딩
    - 파라미터(username)인 경우 setUsername() 메서드를 찾아서 호출

**바인딩 오류**

`age=abe` 처럼 숫자가 들어가야 할 곳에 문자를 넣으면 `BindException`이 발생

**@ModelAttribute 생략 - modelAttributeV2**

```java
/**
 * @ModelAttribute 생략 가능
 * String, int 같은 단순 타입 = @RequestParam
 * argument resolver 로 지정해둔 타입 외 = @ModelAttribute
 */
@ResponseBody
@RequestMapping("/model-attribute-v2")
public String modelAttributeV2(HelloData helloData) {
    log.info("username={}, age={}", helloData.getUsername(),
		helloData.getAge());
		return "ok";
}
```

**@ModelAttribute도 생략 가능**

- String, int, Integer 같은 단순 타입 = @RequestParam 생략이라고 가정
- 나머지 = @ModelAttribute(argument resolver로 지정해둔 타입 외)라고 가정

## HTTP 요청 파라미터 - 단순 텍스트

- HTTP 메시지 바디를 통해 데이터가 직접 넘어오는 경우
  - @RequestParam, @ModelAttribute를 사용 불가
  - HTTP 메시지 바디의 데이터를 InputStream을 사용해서 직접 읽을 수 있음

**RequestBodyStringController -v1**

```java
package hello.springmvc.basic.request

@Slf4j
@Controller
public class RequestBodyStringController {

    @PostMapping("/request-body-string-v1")
    public void requestBodyStringV1(HttpServletRequest request, HttpServletResponse response) throws IOException {
        ServletInputStream inputStream = request.getInputStream();
        String messageBody = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);// stream 기본이 바이트 코드라 인코딩 값을 지정해줘야 함

        log.info("messageBody={}", messageBody);

        response.getWriter().write("ok");
    }
}
```

**v2**

```java
@PostMapping("/request-body-string-v2")
    public void requestBodyStringV2(InputStream inputStream, Writer responseWriter) throws IOException {

        String messageBody = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
        log.info("messageBody={}", messageBody);
        responseWriter.write("ok");
    }
```

- 스프링 MVC는 다음 파라미터를 지원한다.
  - InputStream(Reader): HTTP 요청 메시지 바디의 내용을 직접 조회
  - OutputStream(Writer): HTTP 응답 메시지의 바디에 직접 결과 출력

**v3**

```java
@PostMapping("/request-body-string-v3")
    public HttpEntity<String> requestBodyStringV3(HttpEntity<String> httpEntity) throws IOException {

        String messageBody = httpEntity.getBody();
        log.info("messageBody={}", messageBody);

        return new HttpEntity<>("ok");
    }
```

- 스프링 MVC가 지원하는 파라미터
  - HttpEntity: HTTP header, body 정보를 편리하게 조회
    - 메시지 바디 정보를 직접 조회
    - 요청 파라미터 조회하는 기능과 관계 없음 (완전히 다른 로직)
      - HTTP 메시지 컨버터라는 기능을 사용
  - HttpEntity 응답에도 사용 가능
    - 메시지 바디 정보 직접 반환
    - 헤더 정보 포함
    - view 조회 X
- HttpEntity 를 상속 받은 객체
  - RequestEntity
    - HttpMethod, url 정보를 추가해서 요청에서 사용
  - ResponseEntity
    - HTTP 상태 코드 설정 가능, 응답에서 사용
    - `return new ResponseEntity<String>("Hello World", responseHeaders,
HttpStatus.CREATED)`

**v4**

```java
/**
 * @RequestBody
 * - 메시지 바디 정보를 직접 조회(@RequestParam X, @ModelAttribute X)
 * - HttpMessageConverter 사용 -> StringHttpMessageConverter 적용
 *
 * @ResponseBody
 * - 메시지 바디 정보 직접 반환(view 조회X)
 * - HttpMessageConverter 사용 -> StringHttpMessageConverter 적용*/

@ResponseBody
@PostMapping("/request-body-string-v4")
public String requestBodyStringV4(@RequestBody String messageBody) {
    log.info("messageBody={}", messageBody);
		return "ok";
}
```

- **@RequestBody**
  - 애노테이션 기반의 더 편리하게 HTTP 바디 정보를 조회하는 방법
  - 헤더 정보가 더 필요하다면
    - HttpEntity를 사용하거나 @RequestHeader 사용
- **요청 파라미터 vs HTTP 메시지 바디**
  - 요청 파라미터를 조회하는 기능: `@RequestParam` , `@ModelAttribute`
  - HTTP 메시지 바디를 직접 조회하는 기능: `@RequestBody`
- **@ResponsetBody**
  - 응답 결과를 HTTP 메시지 바디에 담아서 전달
    - 이 경우에도 view 사용 x

## HTTP 요청 메시지 - JSON

**RequestBodyJsonController - v1**

```java
package hello.springmvc.basic.request;

@Slf4j
@Controller
public class RequestBodyJsonController {

    private ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/request-body-json-v1")
    public void requestBodyJsonV1(HttpServletRequest request, HttpServletResponse response) throws IOException {
        ServletInputStream inputStream = request.getInputStream();
        String messageBody = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);

        log.info("messageBody={}", messageBody);
        HelloData helloData = objectMapper.readValue(messageBody, HelloData.class);
        log.info("username={}, age={}", helloData.getUsername(), helloData.getAge());

        response.getWriter().write("ok");
    }
}
```

- HttpServletRequest를 사용해서 직접 HTTP 메시지 바디에서 데이터를 읽어와서 문자로 변환
- 문자로 된 JSON 데이터를 Jackson 라이브러리인 objectMapper를 사용해서 자바 객체로 변환

**v2**

```java
/**
 * @RequestBody
 * HttpMessageConverter 사용 -> StringHttpMessageConverter 적용
 *
 * @ResponseBody
 * - 모든 메서드에 @ResponseBody 적용
 * - 메시지 바디 정보 직접 반환(view 조회X)
 * - HttpMessageConverter 사용 -> StringHttpMessageConverter 적용
 */
@ResponseBody
@PostMapping("/request-body-json-v2")
public String requestBodyJsonV2(@RequestBody String messageBody) throws
IOException {
HelloData data = objectMapper.readValue(messageBody, HelloData.class);
    log.info("username={}, age={}", data.getUsername(), data.getAge());
		return "ok";
}
```

- `@RequestBody` 를 사용해서 HTTP 메시지에서 데이터를 꺼내고 messageBody에 저장
- 문자로 된 JSON 데이터(messageBody) 를 objectMapper를 통해서 자바 객체로 변환

**v3**

```java
/**
 * @RequestBody 생략 불가능(@ModelAttribute 가 적용되어 버림)
 * HttpMessageConverter 사용 -> MappingJackson2HttpMessageConverter (content-type:
application/json)
 *
 */
@ResponseBody
@PostMapping("/request-body-json-v3")
public String requestBodyJsonV3(@RequestBody HelloData data) {
    log.info("username={}, age={}", data.getUsername(), data.getAge());
		return "ok";
}
```

- `HttpEntity`, `@RequestBody` 를 사용
  - HTTP 메시지 컨버터가 HTTP 메시지 바디의 내용을 원하는 문자나 객체 등으로 변환
- `@RequestBody` 생략 불가능
  - 생략시 @ModelAttribute가 적용되어 요청 파라미터를 처리

**v4**

```java
@ResponseBody
@PostMapping("/request-body-json-v4")
public String requestBodyJsonV4(HttpEntity<HelloData> httpEntity) {
		HelloData data = httpEntity.getBody();
		log.info("username={}, age={}", data.getUsername(), data.getAge());
		return "ok";
}
```

- HttpEntity 사용 가능

**v5**

```java
/**
 * @RequestBody 생략 불가능(@ModelAttribute 가 적용되어 버림)
 * HttpMessageConverter 사용 -> MappingJackson2HttpMessageConverter (content-type:
application/json)
 *
 * @ResponseBody 적용
 * - 메시지 바디 정보 직접 반환(view 조회X)
 * - HttpMessageConverter 사용 -> MappingJackson2HttpMessageConverter 적용(Accept:
application/json)
 */
@ResponseBody
@PostMapping("/request-body-json-v5")
public HelloData requestBodyJsonV5(@RequestBody HelloData data) {
    log.info("username={}, age={}", data.getUsername(), data.getAge());
		return data;
}
```

`@ResponseBody`

- 해당 객체를 HTTP 메시지 바디에 직접 넣어줄 수 있다

**@RequestBody 요청**

- \*\*\*\*JSON 요청 → HTTP 메시지 컨버터 → 객체

**@ResponseBody 응답**

- 객체 → HTTP 메시지 컨버터 → JSON 응답

## 응답 - 정적 리소스, 뷰 템플릿

- **정적 리소스**
  - 웹 브라우저에 정적인 HTML, CSS, JS를 제공할 때는 정적 리소스 사용
- **뷰 템플릿 사용**
  - 웹 브라우저에 동적인 HTML을 제공할 때는 뷰 템플릿 사용
- **HTTP 메시지 사용**
  - HTTP API를 제공하는 경우에는 HTML이 아니라 데이터를 전달해야 하므로 HTTP 메시지 바디에 JSON 같은 형식으로 데이터를 실어 보낸다

### 정적 리소스

- 스프링 부트는 클래스 패스의 다음 디렉토리에 있는 정적 리소스를 제공
  - /static , /public , /resources , /META-INF/resources
- src/main/resources
  - 리소스를 보관하는 곳으로, 클래스 패스의 시작 경로
  - 디렉토리에 리소스를 넣어두면 스프링 부트가 정적 리소스로 서비스를 제공
- 정적 리소스 경로
  - `src/main/resources/static`

### 뷰 템플릿

- 뷰 템플릿을 거쳐서 HTML이 생성되고 뷰가 응답을 만들어서 전달
- 뷰 템플릿 경로
  - src/main/resources/templates
- 뷰 템플릿 생성
  ```java
  <!DOCTYPE html>
  <html xmlns:th="http://www.thymeleaf.org">
  <head>
      <meta charset="UTF-8">
      <title>Title</title>
  </head>
  <body>
  <p th:text="${data}">empty</p>
  </body>
  </html>
  ```
- 뷰 템플릿을 호출하는 컨트롤러
  ```java
  package hello.springmvc.basic.response;

  @Controller
  public class responseViewController {

      @RequestMapping("/response-view-v1")
      public ModelAndView responseViewV1() {
          ModelAndView mav = new ModelAndView(("response/hello"))
                  .addObject("data", "hello!");
          return mav;
      }

      @RequestMapping("/response-view-v2")
      public String responseViewV2(Model model) {
          model.addAttribute("data", "hello!");
          return "response/hello";
      }

      @RequestMapping("/response/hello")
      public void responseViewV3(Model model) {
          model.addAttribute("data", "hello!");
      }
  }

  ```
- **String을 반환하는 경우 - View or HTTP 메시지**
  - `@ResponseBody` 가 없으면 response/hello로 뷰 리졸버가 실행되어서 뷰를 찾고 렌더링
  - `@ResponseBody` 가 있으면 뷰 리졸버를 실행하지 않고, HTTP 메시지 바디에 직접 response/hello 라는 문자 입력
- **Void를 반환하는 경우**
  - `@Controller`를 사용하고, `HttpServletResponse`, `OutputStream(Writer)` 같은 HTTP 메시지 바디를 처리하는 파라미터가 없으면 요청 URL을 참고해서 논리 뷰 이름으로 사용
    - **하지만 이 방식은 명시성이 떨어지고 조건이 딱 맞는 경우도 별로 없어서 권장 x**

## HTTP 응답 - HTTP API, 메시지 바디에 직접 입력

- 정적 리소스나 뷰 템플릿을 거치지 않고, 직접 HTTP 응답 메시지를 전달하는 경우

**ResponseBodyController**

```java
package hello.springmvc.basic.response;

@Slf4j
//@Controller
//@ResponseBody
@RestController
public class ResponseBodyController {

    @GetMapping("/response-body-string-v1")
    public void responseBodyV1(HttpServletResponse response) throws IOException {
        response.getWriter().write("ok");
    }

    @GetMapping("/response-body-string-v2")
    public ResponseEntity<String> responseBodyV2() {
        return new ResponseEntity<>("ok", HttpStatus.OK);
    }

//    @ResponseBody
    @GetMapping("/response-body-string-v3")
    public String responseBodyV3() {
        return "ok";
    }

    @GetMapping("/response-body-json-v1")
    public ResponseEntity<HelloData> responseBodyJsonV1() {
        HelloData helloData = new HelloData();
        helloData.setUsername("userA");
        helloData.setAge(20);
        return new ResponseEntity<>(helloData, HttpStatus.OK);

    }

    @ResponseStatus(HttpStatus.OK)
//    @ResponseBody
    @GetMapping("/response-body-json-v2")
    public HelloData responseBodyJsonV2() {
        HelloData helloData = new HelloData();
        helloData.setUsername("userA");
        helloData.setAge(20);
        return helloData;
    }
}
```

- **responseBodyV1**
  - 서블릿을 직접 다룰 때처럼 HttpServletResponse 객체를 통해서 HTTP 메시지 바디에 직접ok 응답 메시지를 전달한다.
  - `response.getWriter().write("ok")`
- **responseBodyV2**
  - ResponseEntity 엔티티는 HttpEntity 를 상속
    - HTTP 메시지의 헤더/바디 정보 포함, HTTP 응답 코드를 설정 가능
    - HttpStatus.CREATED 로 변경하면 201 응답 확인 가능
- **responseBodyV3**
  - ResponseBody를 사용하면 view를 사용하지 않고, HTTP 메시지 컨버터를 통해서 HTTP 메시지를 직접 입력할 수 있다.
  - ResponseEntity 도 동일한 방식으로 동작한다.
- **responseBodyJsonV1**
  - ResponseEntity 를 반환
    - HTTP 메시지 컨버터를 통해서 JSON 형식으로 변환되어서 반환 된다.
- **responseBodyJsonV2**
  - ResponseEntity 는 HTTP 응답 코드를 설정할 수 있는데, @ResponseBody를 사용하면 이런 것을 설정하기 까다롭다.
  - @ResponseStatus(HttpStatus.OK) 애노테이션을 사용하면 응답 코드도 설정할 수 있다.
    - 하지만 애노테이션이므로 응답 코드를 동적으로 변경 불가능
    - 필요하다면 ResponseEntity 사
- **@RestController**
  - Rest API(HTTP API)를 만들 때 사용하는 컨트롤러
  - @RestController 안에 Controller와 ResponseBody 포함

## HTTP 메시지 컨버터

**HTTP 메시지 컨버터**

- JSON 데이터를 HTTP 메시지 바디에서 직접 읽거나 쓰는 경우 사용

**스프링 입문 일부 내용 발췌**

- **@ResponseBody 사용 원리**
  ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/0aaf4a74-921a-401b-8ef7-79a743f1e4df/968ce6f2-cb40-429c-b6c9-b404858b52f0/Untitled.png)
  - `@ResponseBody` 를 사용
    - HTTP의 BODY에 문자 내용을 직접 반환
    - viewResolver 대신에 HttpMessageConverter가 동작
      - 기본 문자처리: StringHttpMessageConverter
      - 기본 객체처리: MappingJackson2HttpMessageConverter
      - byte 처리 등등 기타 여러 HttpMessageConverter가 기본으로 등록되어 있음

**스프링 MVC가 사용하는 HTTP 메시지 컨버터**

- HTTP 요청
  - @RequestBody, HttpEntity(RequestEntity)
- HTTP 응답
  - @ResponseBody , HttpEntity(ResponseEntity)
- HTTP 메시지 컨버터 인터페이스
  ```java
  package org.springframework.http.converter;

  public interface HttpMessageConverter<T> {

  		boolean canRead(Class<?> clazz, @Nullable MediaType mediaType);
  		boolean canWrite(Class<?> clazz, @Nullable MediaType mediaType);

  		List<MediaType> getSupportedMediaTypes();

  		T read(Class<? extends T> clazz, HttpInputMessage inputMessage)
  						throws IOException, HttpMessageNotReadableException;

  		void write(T t, @Nullable MediaType contentType, HttpOutputMessage
  		outputMessage) throws IOException, HttpMessageNotWritableException;
  }
  ```
  - HTTP 메시지 컨버터는 HTTP 요청, 응답 모두 사용
    - canRead(), canWrite(): 메시지 컨버터가 해당 클래스, 미디어타입을 지원하는지 체크
    - read(), write(): 메시지 컨버터를 통해서 메시지를 읽고 쓰는 기능

**스프링 부트 기본 메시지 컨버터**

<aside>
👻 0 = ByteArrayHttpMessageConverter
1 = StringHttpMessageConverter
2 = MappingJackson2HttpMessageConverter

</aside>

- 대상 클래스 타입과 미디어 타입(http 메시지 헤더 타입) 둘을 체크해서 사용여부 결정
  - 만족하지 않으면 다음 메시지 컨버터로 우선 순위가 넘어간다
- ByteArrayHttpMessageConverter: byte[] 데이터를 처리
  - 클래스 타입: bye[] , 미디어타입: _/_ ,
  - 요청 예) @RequestBody byte[] data
  - 응답 예) @ResponseBody return byte[] 쓰기 미디어타입 application/octet-stream
- StringHttpMessageConverter : String 문자로 데이터를 처리한다.
  - 클래스 타입: String , 미디어타입: _/_
  - 요청 예) @RequestBody String data
  - 응답 예) @ResponseBody return "ok" 쓰기 미디어타입 text/plain
- MappingJackson2HttpMessageConverter : application/json
  - 클래스 타입: 객체 또는 HashMap , 미디어타입 application/json 관련
  - 요청 예) @RequestBody HelloData data
  - 응답 예) @ResponseBody return helloData 쓰기 미디어타입 application/json 관련

## 요청 매핑 핸들러 어뎁터 구조

**Spring MVC 구조**

- ArgumentResolver 때문에 타입과 상관없이 파라미터를 유연하게 처리가능

1. 애노테이션 기반 컨트롤러 사용
2. RequestMappingHandlerAdapter 호출
3. ArgumentResolver를 호출
4. 파라미터 값 생성
5. 다시 역순으로 반환해서 컨트롤러(핸들러)에게 반환

**HandlerMethodArgumentResolver == ArgumentResolver**

```java
public interface HandlerMethodArgumentResolver {

		boolean supportsParameter(MethodParameter parameter);
		@Nullable
		Object resolveArgument(MethodParameter parameter,
		@Nullable ModelAndViewContainer mavContainer,
		NativeWebRequest webRequest,
		@Nullable WebDataBinderFactory binderFactory) throws Exception;
}
```

- 동작 방식
  - ArgumentResolver의 supportsParameter()를 호출해서 해당 파라미터를 지원하는지 체크
  - 이후 resolveArgument()를 호출해서 실제 객체 생성
  - 컨트롤러 호출 시 반환

원한다면 이 인터페이스를 확장해서 원하는 ArgumentResolver를 생성 가능

**HandlerMethodReturnValueHandler == ReturnValueHandler**

- ArgumenterResolver와 비슷하지만 반대로 동작
- 요청이 아닌 응답 값을 변환하고 처리
  - 컨트롤러에서 String으로 뷰 이름을 반환해도 동작하는 이유

**HTTP 메시지 컨버터**

- 동작 방식
  - 요청의 경우
    - 서블릿에서 어댑터를 통해 컨트롤러 생성 요청
    - @RequestBody / HttpEntity를 처리하는 ArgumentResolver 호출
    - HTTP 메시지 컨버터를 호출해 필요한 객체 생성
  - 응답의 경우
    - @ResponseBody와 HttpEntity를 처리하는 ReturnValueHandler 호출
    - HTTP 메시지 컨버를 응답 결과 생성
  ### 확장
  - 스프링은 위에서 설명한 모든 컴포넌트 들을 인터페이스로 제공
  - 그래서 WebMvcConfiguurer를 상속 받아서 스프링 빈으로 등록해 기능 확장 가능
