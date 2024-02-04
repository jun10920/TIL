# Section06\_지역 변수와 스코프

- 좋은 프로그램은 무한한 자유가 있는 프로그램이 아니라 적절한 제약이 있는 프로그램이다.

## 명시적 형변환

```python
public class Switch2 {
    public static void main(String[] args) {
        long maxIntValue = 2147483647; // int 최고값
        long maxIntOver = 2147483648L; // int 최고값 +1
        int intValue = 0;

        intValue = (int) maxIntValue;
        System.out.println("maxIntValue casting = " + intValue);

        intValue = (int) maxIntOver;
        System.out.println("maxIntValue casting = " + intValue);

    }
}
```

- 오버플로우
  - int의 범위를 넘어서는 값을 저장하면 다시 최솟값으로 돌아와서 1씩 증가한다.

## 계산과 형변환

- 같은 타입끼리의 계산은 같은 타입의 결과를 낸다
  - int + int = int, double + double = double
- 서로 다른 타입의 계산은 큰 범위로 자동 형변환이 일어난다.
  - int + long = long + long으로 자동 형변환
  - int + double = double + double로 자동 형변환

```java
double div2 = 3 /2; // int / int
double div2 = 1; // int형이니까 int 타입으로 결과 반환
double div2 = (double) 1; // int -> double형으로 자동 형변환
double div2 = 1.0;
```
