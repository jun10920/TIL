# Section08\_배열

## 배열의 선언과 생성

```java
int[] students = new int[5]; //int 5개 크기의 배열 생성
==
int[] students = new int[]{1, 2, 3, 4, 5};
==
int[] students = {1, 2, 3, 4, 5};
int[] students x001; // new int[5]의 결과로 생성한 배열의 주소값 반환
students = x001 // int형 배열 변수 students에 주소값 저장
```

## 배열 값 읽기

```java
// 1. 변수 값 읽기
System.out.println("학생 1 점수: + students[0]);
// 2. 변수에 있는 참조값을 통해 실제 배열에 접근, 인덱스를 사용해서 해당 위치의 요소에 접급
System.out.println("학생 1 점수: + x001[0]);
// 3. 배열의 값을 읽음
System.out.println("학생 1 점수: + 90);
```

## 기본형 vs 참조형

- 기본형(Primitive Type)은 우리가 일반적으로 아는 데이터 타입
- 참조형(Reference Type)은 주소 값 참조하는 것
  - 배열, 객체, 클래스를 담는 변수들
- 기본형은 처음부터 데이터의 크기가 정해지지만 빠르고 효율적이다
- 참조형은 데이터에 유연성을 제공하므로 복잡한 데이터 구조를 만들 수 있지만 기본형에 비해 느리다.

## 2차원 배열

```java
// 초기화 1
int[][] arr = new int[2][3]
~~~~
// 초기화 2
int[][] arr = new int[][]{
	{1,2,3},
	{4,5,6}
};
// 초기화 3
int[][] arr ={
	{1,2,3},
	{4,5,6}
};
```

```java
// 2차원 배열 자동 초기화
public class Arr01 {
    public static void main(String[] args) {
        int [][] arr = new int[2][3];

        int i = 1;
        for(int row = 0; row < arr.length; row++){
            for(int column = 0; column<arr[row].length; column++){
                arr[row][column] = i++;
            }
        }
        for(int row = 0; row < arr.length; row++){
            for(int column = 0; column<arr[row].length; column++){
                System.out.print(arr[row][column]+" ");
            }
            System.out.println();
        }
    }
}
```

## 향상된 for 문 (for-each문) / 실무에서 제일 많이 씀

```java
for(int i = 0; i<arr.length; i++){
	int num = nums[i];
	System.out.println(num);
}
==
for (int num:nums){
	System.out.println(num);
}
```

- 처음부터 끝까지 배열을 모두 순회해서 사용하고 싶으면 향상된 for문을 사용
- 단축키는 **iter**
- 인덱스 값의 출력이 필요할 때는 사용할 수 없다.
