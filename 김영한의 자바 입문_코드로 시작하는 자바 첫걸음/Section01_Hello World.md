# Section01_Hello World

# TIP

- tab으로 들여쓰기는 space 4번과 같다
- 단축키
  [intelliJ 윈도우 단축키](https://rebornbb.tistory.com/entry/intelliJ-intelliJ-윈도우-단축키-intelliJ-다이어그램)
- **psvm**
  - public static void main(String args[]) 단축키
- **sout**
  - System.out.println() 단축키

# 자바 표준 스펙

- 오라클에서 **자바 표준 스펙**을 만든다
  - 자바 컴파일러 스펙
  - 자바 실행 라이브러리 스펙
  - 자바 가상 머신 스펙
- 각 회사에서 스펙에 맞춰서 자바를 만든다.
  - 각 회사마다 비슷하지만 약간의 장단점이 있다.
  - Amazon Corretto에서 만든 건 AWS에 최적화되어 있는 식

# 컴파일과 실행

- **소스 코드를 작성**
- **컴파일러가 소스 코드를 컴파일**
  - 자바가 제공하는 javac 프로그램 실행
  - .java(소스 코드) → .class(실행 파일)
  - 소스 코드를 바이트 코드로 변환하여 JVM에서 빠르게 실행할 수 있게 최적화하고 문법 오류도 검출
- **자바 프로그램 실행**
  - 자바가 제공하는 java 프로그램 사용
  - JVM이 실행되면서 프로그램이 작동
- 인텔리제이가 이 과정을 대신 해줌

# 운영체제와 독립성

- 자바는 JVM 위에서 작동하기 때문에 OS와 상관없이 작동이 가능하다
- 윈도우나 맥 OS에서 코딩하더라도 서버에서 주로 사용하는 리눅스에서도 AWS 리눅스 서버에 Amazon Corretto 자바를 다운로드하면 실행하는데 아무 문제 없다.
