# Section04\_조건문

## if문과 else if문

- if문과 else if문의 차이
  - if 문은 각자가 다 다른 블럭이라서 하나의 if 문을 통과하고 나머지가 필요 없더라도 모든 if 문을 검사한다.
  - else if 문은 여러 개의 if 문을 하나의 블럭으로 묶는 것이다.
  - 각 조건을 모두 검사해서 적용하고 싶다면 if문을 여러 개 사용
  - 조건문의 분기를 한번만 적용하고 싶다면 else if 문을 사용

## 새로운 switch 문

- 기존의 switch 문 코드

```python
package cond;

public class Switch2 {
    public static void main(String[] args) {
        int grade = 2;

        int coupon;

        switch (grade){
            case 1:
                coupon = 1000;
                break;
            case 2:
                coupon = 2000;
                break;
            case 3:
                coupon = 3000;
                break;
            default:
                coupon = 50;
        }
        System.out.println(coupon);
    }
}
```

- **새로 바뀐 switch 문**

```python
package cond;

public class Switch2 {
    public static void main(String[] args) {
        int grade = 2;

        int coupon = switch (grade) {
            case 1 -> 1000;
            case 2 -> 2000;
            case 3 -> 3000;
            default -> 500;
        };
        System.out.println(coupon);
    }
}
```

## 삼항 연산자

```python
package cond;

public class Switch2 {
    public static void main(String[] args) {
        int age = 18;
				#조건에 맞으면? 1번, 아니면 2번으로 출력
        String status = (age >= 18) ? "성인" : "미성년자";
        System.out.println("age = " + age + " statue = " + status);
    }
}
```
