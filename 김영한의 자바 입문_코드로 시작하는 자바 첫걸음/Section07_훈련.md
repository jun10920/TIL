# Section07\_훈련

## 자주 쓰는 반복문

- 일반적인 경우

```java
public class ScannerEx2 {
    public static void main(String[] args) {
        Scanner scn = new Scanner(System.in);
        int sum = 0;
        double count = 0;
        while (true) {
            System.out.print("숫자를 입력하세요. (-1를 입력하면 종료): ");
            int num = scn.nextInt();
            if (num == -1) break;
            sum += num;
            count++;
        }
        System.out.println("입력한 숫자들의 합계: "+sum);
        System.out.println("입력한 숫자들의 평균: "+sum/count);
    }
}
```

- 다르지만 자주 쓰는 경우

```java
public class ScannerEx2 {
    public static void main(String[] args) {
        Scanner scn = new Scanner(System.in);
        int sum = 0;
        double count = 0;
        int num = 0;
        while ((num = scn.nextInt()) != -1) {
            System.out.print("숫자를 입력하세요. (-1를 입력하면 종료): ");
            sum += num;
            count++;
        }
        System.out.println("입력한 숫자들의 합계: "+sum);
        System.out.println("입력한 숫자들의 평균: "+sum/count);
    }
}
```
