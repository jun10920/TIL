# Section04\_생성자

## this의 생략

- 멤버변수(클래스)와 지역변수(메소드, 이 경우에는 매개변수)가 다르면 this를 생략해도 메소드 안의 변수가 멤버변수를 찾아간다.
- this는 지금 본인이 속한 클래스의 주소 값을 의미한다.
- 생성자의 첫 문장에 작성해야 한다.

## 생성자의 장점

- 제약 - 생성자 호출 필수
  - 객체를 생성할 때 직접 정의한 생성자가 있다면, 직접 정의한 생성자를 반드시 호출해야 한다는 점이다.
  - 그래서 **필수값 입력을 보장**할 수 있다.
