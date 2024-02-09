# Section02\_스프링 웹 개발 기초

## 정적 컨텐츠

- 스프링에서는 정적 컨텐츠 기능을 제공
  ![정적컨텐츠](./images/스프링%20웹개발%20기초1.png)
- 웹 브라우저에서 주소를 보내면 스프링 부트의 내장 톰캣 서버가 우선 controller를 찾는다.
- 현재 controller가 없으므로 리소스 안에서 정적 html 파일을 찾는다
- 찾으면 이를 웹브라우저에 반환한다.

## MVC와 템플릿엔진

- Controller code

```java
@Controller
public class HelloController {
		// http://localhost:8080/hello-mvc?name=spring!! 호출

    @GetMapping("hello-mvc")
    public String helloMvc(@RequestParam("name") String name, Model model) {
		// 주소에 의해서 mapping 되면 name에 get 파라미터(spring!!)을 받아서 name에 대입
		// 이후 model로 넘어가 static html 파일로 반환
        model.addAttribute("name", name);
        return "hello-template";
    }
}

```

- hello.template.html code

```html
<html xmlns:th="http://www.thymeleaf.org">
  <body>
    <p th:text="'hello ' + ${name}">hello! empty</p>
    <!-- key가 name인 value: spring 입력, 입력값이 없을 때는 hello! empty 출력 -->
  </body>
</html>
```

![MVC와 템플릿 엔진](./images/스프링%20웹개발%20기초2.png)

## API (Json 형식)

- controller code
  ```java
  @Controller
  public class HelloController {
      @GetMapping("hello-string")
      @ResponseBody
      public String helloString(@RequestParam("name") String name) {
          return "hello " + name;
      }
  }
  ```
  - MVC와 차이점
    - MVC는 내용을 model에 담아 view 전달해서 수정된 html 파일을 웹 브라우저에 전송하는 방법
    - 하지만 API 방식은 직접 데이터를 바로 화면에 전송 (html 파일이 아니라)
    - 그래서 소스 코드에 hello + name값만 입력되어 있음
    - ReponseBody 애노테이션
      - http에서의 body에 직접 전송한다는 의미
  - API 방식을 사용하는 이유는 JSON 형식으로 데이터를 넘기기 위해서
- controller code
  ```java
  @Controller
  public class HelloController {
      @GetMapping("hello-api")
      @ResponseBody
      public Hello helloApi(@RequestParam("name") String name) {
          Hello hello = new Hello();
          hello.setName(name);
          return hello;
      }

  // http://localhost:8080/hello-api?name=spring!! 라고 입력

      static class Hello {
          private String name; // key가 name인 객체

          public String getName() {
              return name;
          }
          public void setName(String name) {
              this.name = name;
          }
      }
  }
  ```
- @ResponseBody 사용 원리
  ![API](./images/스프링%20웹개발%20기초3.png)
- @ResponseBody 사용
  - HTTP의 BODY에 문자 내용을 직접 반환
  - viewResolver 대신에 HttpMessageConverter가 동작
    - 문자의 경우 StringHttpMessageConverter에게 전달
    - 객체의 경우 MappingJackson2HttpMessageConverter에게 전달
      - key와 vaule 값으로 웹 브라우저에게 반환
      - Jackson은 객체를 json으로 변환하는 라이브러리
    - byte 처리 등등 기타 여러 HttpMessageConverter가 기본으로 등록되어 있음
- 클라이언트의 HTTP 헤더와 서버의 컨트롤러 반환 타입 정보 둘을 조합해서 HttpMessageConverter가 선택
