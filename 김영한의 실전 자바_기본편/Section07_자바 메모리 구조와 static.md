# Section07\_자바 메모리 구조와 static

## 자바 메모리 구조

### 메서드 영역

- 프로그램을 실행하는데 필요한 공통 데이터 관리
  - 클래스 정보
    - 클래스의 실행 코드(바이트 코드)
    - 필드
    - 메서드
    - 생성자
  - static 영역
    - stiatic 변수들을 저장
  - 런타임 상수
    - 공통 리터럴 상수를 보관 (문자 그대로 쓰여있는 경우)

### 스택 영역

- 실제 프로그램이 실행되는 영역
- 메서드 실행 시 스택 프레임이 하나씩 쌓임
  - 지역 변수
  - 중간 연산 결과
  - 메서드 호출 정보

### 힙 영역

- 객체(인스턴스)와 배열이 생성되는 영역
- 가비지 컬렉션이 이루어지는 영역

- 메서드는 메서드 영역에
  - 힙 영역에서 각각의 필드들은 따로 저장이 된다.
  - 하지만 메서드는 공통으로 사용하므로 메서드 영역에서 공통으로 관리되고 실행된다.

## 스택 영역

- main 함수 안에 메서드1, 메서드1 안에 메서드2가 있는 상황
  - main 함수 실행-스택에 메인 함수 스택 프레임 생성
  - 메서드 1 실행\_스택에 메서드1 스택 프레임 생성 (지역 변수 포함)
  - 메서드 2 실행\_스택에 메서드2 스택 프레임 생성 (지역 변수 포함)
  - 역순으로 메서드 2 제거 → 메서드 1 제거 → 메인 함수 제거
- 자바는 스택 영역을 사용해서 메서드 호출과 지역 변수(매개변수 포함) 관리
- 메서드를 계속 호출하면 스택 프레임이 계속 쌓임
- 스택 프레임이 모두 제거되면 프로그램도 종료

## static 변수

- static 변수, 정적 변수, 클래스 변수라고 부른다.
- static 변수에 접근하는 방법은 **클래스 명 자체에 .(dot)을 사용**한다.
  - 인스턴스를 통해서 접근도 가능
    - 하지만 클래스 변수라는 의미를 확실히 하기 위해서 사용은 잘 하지 않음
- 정적 변수는 힙에서 생성되지 않고 메서드 영역에서 관리된다.

## 변수 정리

```java
public class Data3 {
	public String name;
	public static int count;
}
```

- 멤버 변수(둘 다 클래스 내의 변수이므로 멤버 변수)

  - 인스턴스 변수
    - static이 붙지 않은 멤버 변수는 인스턴스를 생성해야 사용 가능
    - 인스턴스를 생성할 때마다 새로 만들어짐
  - 클래스 변수(static이 붙은 변수)
    - 클래스 변수, 정적 변수, static 변수 모두 사용
    - 인스턴스와 무관하게 클래스에 바로 접근해서 사용
    - 클래스 별로 1 개만 만들어지므로, 여러곳에서 공유하는 목적으로 주로 사용

- 변수와 생명주기
  - 지역 변수(매개변수 포함)
    - 스택 영역 안의 스택 프레임에 보관
    - 메서드가 종료되면 지역 변수도 함께 제거되므로 생존 주기가 짧음
  - 인스턴스 변수
    - 힙 영역을 사용
    - GC가 발생하기 전까지 생존하므로 지역 변수보다 생존 주기가 길다
  - 클래스 변수
    - 메서드 영역의 static 영역에 보관되는 변수
    - JVM이 로딩 되는 순간부터 종료될 때까지 생명주기가 이어짐

## static 메서드

- 정적 메서드는 객체 생성 없이 **클래스명 + .(dot) + 메서드 명**으로 바로 호출할 수 있다.
- 정적 메서드 또는 클래스 메서드라고 부른다.
- static 메서드 사용법
  - static 메서드는 static만 사용할 수 있다.
  - 클래스 내부의 기능을 사용할 때,
    - 정적 메서드는 static이 붙은 정적 메서드나 정적 변수만 사용할 수 있다.
      - 메서드 영역에서 static 영역은 프로그램이 시작하자마자 할당되지만, 힙 영역은 동적으로 할당하기 때문에 참조값을 알 수 없어 사용할 수 없다.
    - 정적 메서드는 인스턴스 변수나, 인스턴스 메서드를 사용할 수 없다.
      - 매개변수로 참조값을 전달 받았을 경우에는 가능하다.
  - 반대로 모든 곳에서 static을 호출할 수 있다.
    - 정적 메서드는 공용 기능이다.
    - 접근 제어자만 허락한다면 클래스를 통해 모든 곳에서 static을 호출할 수 있다.

## 메서드 정리

- 멤버 메서드
  - 인스턴스 메서드
  - 클래스 메서드
- 클래스 메서드의 활용
  - 객체 생성이 필요 없이 메서드의 호출만으로 필요한 기능을 수행할 때 주로 사용
  - 간단한 메서드 하나로 끝나는 유틸리티성 메서드에 자주 사용
    - 수학의 여러가지 기능을 담은 클래스 등등
  - 호출시
    - 인스턴스명으로, 클래스명으로 모두 가능
      - 하지만 변수와 같은 이유로 클래스명으로 하는 것을 권장
    - **import static 구문으로 클래스명 생략 가능 / 정적 변수에서도 가능**
      ```java
      import static static2.DecoData.staticCall;

      public class DecoDataMain {

      	public static void main(String[] args) {
      		staticCall(); //DecoData.staticCall 이라고 적지 않아도 됨
      	}
      }
      ```

## main() 메서드

- main() 메서드는 정적 메서드
- 따라서 main() 메서드에서 호출하는 메서드는 정적 메서드만 사용
