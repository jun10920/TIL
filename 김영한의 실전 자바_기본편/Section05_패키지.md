# Section05\_패키지

## 패키지 호출 방법

- 사용자와 같은 위치
  - 패키지 경로 생략 가능
- 사용자와 다른 위치
  - pack.a.User (패키지의 전체 경로 포함)
    ```java
    package pack;

    public class PackageMain {

        public static void main(String[] args) {
            Data data = new Data();
            pack.a.User user = new pack.a.User();
        }
    }
    ```

## import시 중복 제거

```java
package pack;

import pack.a.User;

public class PackageMain {

    public static void main(String[] args) {
	      User user = new User();
    }
}
```

- \*사용 시 패키지에 있는 내용 전부 import 가능
- 다른 패키지에 있는 같은 이름의 클래스를 사용하는 경우
  ```java
  package pack;

  import pack.a.User;

  public class PackageMain {

      public static void main(String[] args)
  	      User user = new User();
  				pack.b.User = new pack.b.User();
      }
  }
  ```
  - 한 개는 import로 생략할 수 있지만, 다른 하나는 경로를 전부 적어줘야 한다.

## 패키지 규칙

- 패키지의 이름과 위치는 폴더(디렉토리) 위치와 같아야 한다.
- 패키지 이름은 모두 소문자를 사용한다.
- **패키지 이름의 앞 부분에는 일반적으로 회사의 도메인 이름을 거꾸로 사용**
  - com.company.myapp
  - 외부 라이브러리를 여러 개 사용하더라도 위의 관례를 지키면 충돌을 방지
  - 오픈소스나 라이브러리를 만들어서 제공한다면 꼭 지키는 것이 좋다.

## 패키지와 계층 구조

- a
  - b
  - c
- 이렇게 하면 a, a.b, a.c 3개의 패키지가 존재한다.
- 하지만 이는 사람이 파악하기 쉽게 계층 구조를 표현한 것일뿐, 실제로는 서로 독립적인 패키지다.
  - a 패키지에서 a.b를 사용하려고 해도 import해야 한다.

## 패키지 활용

- 패키지 활용 예시
- com.helloshop
  - user
    - User
    - UserService
  - product
    - Product
    - ProductService
  - order
    - Order
    - OrderService
    - OrderHistory
