# Section01\_프로젝트 환경설정

## 간단한 웹 애플리케이션 개발하면서 강의 진행

- 스프링 프로젝트 생성
- 스프링 부트로 웹 서버 실행
- 회원 도메인 개발
- 웹 MVC 개발
- DB연동 - JDBC, JPA, 스프링 데이터 JPA
- 테스트 케이스 작성

## 핵심 라이브러리

### 스프링 부트 라이브러리

- spring-boot-starter-web
  - spring-boot-starter-tomcat: 톰캣 (웹서버)
  - spring-webmvc: 스프링 웹 MVC
- spring-boot-starter-thymeleaf: 타임리프 템플릿 엔진(View)
- spring-boot-starter(공통): 스프링 부트 + 스프링 코어 + 로깅
  - spring-boot
    - spring-core
  - spring-boot-starter-logging
    - logback, slf4j

### 테스트 라이브러리

- spring-boot-starter-test
  - junit: 테스트 프레임워크
  - mockito: 목 라이브러리
  - assertj: 테스트 코드를 좀 더 편하게 작성하게 도와주는 라이브러리
  - spring-test: 스프링 통합 테스트 지원

## MVC (Model-View-Controller)

- MVC는 소프트웨어 엔지니어링에서 널리 사용되는 아키텍처 패턴
- 애플리케이션을 세 가지 주요 구성 요소로 분리하여 개발하는 방법론
- 분리를 통해 애플리케이션의 유지보수성, 확장성 및 테스트 용이성을 향상
- 개발 프로세스를 체계화하고 코드의 가독성 및 관리를 용이하게 함

### **모델(Model)**

- **정의**: 애플리케이션의 데이터 구조를 정의하고, 데이터 관리 및 비즈니스 로직을 담당합니다.
- **역할**: 데이터베이스, 파일, 외부 서비스 등에서 데이터를 조회하거나 저장하는 로직을 포함하며, 이 데이터를 가공하여 컨트롤러에 전달합니다.
- **예시**: 사용자 정보, 상품 목록, 주문 내역 등 애플리케이션에서 사용되는 데이터 구조와 관련 로직을 포함합니다.

### **뷰(View)**

- **정의**: 사용자 인터페이스(UI)를 담당하는 부분으로, 사용자에게 정보를 시각적으로 표현합니다.
- **역할**: 모델로부터 전달받은 데이터를 바탕으로 사용자에게 보여질 화면을 구성합니다. HTML, CSS, JavaScript 등을 사용하여 구현될 수 있습니다.
- **예시**: 웹 페이지, 모바일 앱 화면, 사용자 대시보드 등 사용자가 상호작용하는 모든 인터페이스 요소를 포함합니다.

### **컨트롤러(Controller)**

- **정의**: 사용자의 입력을 받아 모델과 뷰 사이의 상호작용을 조정합니다.
- **역할**: 사용자의 요청을 받아 처리하고, 그에 따라 모델을 업데이트하거나 뷰를 변경하는 등의 작업을 수행합니다. 사용자의 액션에 대한 로직을 구현하며, 어떤 모델 데이터가 필요하고, 어떤 뷰를 사용자에게 보여줄지 결정합니다.
- **예시**: 사용자가 웹 애플리케이션에서 로그인 요청을 할 때, 컨트롤러는 사용자의 입력 데이터를 받아 모델을 통해 인증을 수행하고, 결과에 따라 성공 뷰나 오류 메시지를 표시하는 뷰를 선택합니다.

### **MVC 패턴의 장점**

- **유지보수성**: 애플리케이션의 비즈니스 로직, 사용자 인터페이스, 사용자 입력 처리를 분리함으로써 각 부분을 독립적으로 수정하고 개선 가능
- **확장성**: 새로운 기능 추가나 기존 기능의 변경 용이
  - 예를 들어, 새로운 뷰 타입을 추가하거나 비즈니스 로직을 변경할 때, 다른 구성 요소에 미치는 영향이 최소화
- **테스트 용이성**: 각 구성 요소를 분리함으로써 단위 테스트와 같은 테스트 작업이 용이

## thymeleaf 템플릿엔진 동작 확인

![thymeleaf 템플릿엔진 동작 확인](./images/thymeleaf%20템플릿엔진%20동작%20확인.png)

- Controller에서 리턴 값으로 문자를 반환하면 viewResolver가 화면을 찾아서 처리
  - 스프링 부트 템플릿엔진 기본 viewName 매핑
  - resources:templates/ + {ViewName} + .html
- **HelloController 코드**
  ```java
  package hello.hellospring.controller;
  import org.springframework.stereotype.Controller;
  import org.springframework.ui.Model;
  import org.springframework.web.bind.annotation.GetMapping;

  @Controller
  public class HelloController {
      @GetMapping("hello")
      public String hello(Model model) {
  				// key: data, vaule: hello!!
  				// className : hello
          model.addAttribute("data", "hello!!");
          return "hello";
      }
  }
  ```
- **resources/templates/hello.html 코드**
  ```java
  <!DOCTYPE HTML>
  <html xmlns:th="http://www.thymeleaf.org">
  <head>
      <title>Hello</title>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  </head>
  <body>
  <p th:text="'안녕하세요. ' + ${data}" >안녕하세요. 손님</p>
  </body>
  </html>
  ```

## 빌드하고 실행하기

1. **./gradlew build**
2. **cd build**
3. **cd libs**
4. **java - jar hello-spring-0.0.1-SNAPSHOT.jar**

- 서버 배포할 때는 jar 파일만 서버에 넣고 실행하기만 하면 된다.

## etc

- Gradle이 버전 설정하고 라이브러리 불러오는 역할 (자세한 건 추후에 공부)
- 현업에선 sout으로 출력을 안하고 로그로 출력을 한다.
- 심각한 에러를 따로 출력할 수가 있고, 따로 관리를 할 수 있다.
