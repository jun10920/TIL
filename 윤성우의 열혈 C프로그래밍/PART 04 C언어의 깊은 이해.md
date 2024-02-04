# PART 04 C언어의 깊은 이해

# ch21. 문자와 문자열 관련 함수

## 스트림과 데이터의 이동

### 스트림

- 프로그램과 콘솔(키보드, 모니터)은 연결되어 있는 개체가 아닌 서로 떨어져 있는 개체
- 데이터 입출력을 위해선 이들을 연결 시켜 주는 매개체 필요
- 스트림이 매개체 역할
- 운영체제에서 스트림을 제공

### 스트림의 생성과 소멸

- 파일과의 연결을 위한 스트림의 생성은 직접 요구
- 콘솔 입출력을 위한 ‘입력 스트림’과 ‘출력 스트림’은 프로그램의 실행과 종료에 따라 자동으로 생성, 소멸
  - 이를 **표준 스트림**이라 부른다.
  - stdin **표준 입력 스트림** / 키보드 대상으로 입력
  - stdout **표준 출력 스트림** /모니터 대상으로 출력
  - stderr **표준 출력 스트림** / 모니터 대상으로 출력

## 문자 단위 입출력 함수

### 문자 출력 함수

```c
#include <stdio.h>
int putchar(int c);
int fputc(int c, FILE *stream);
// 함수 호출 성공 시 쓰여진 문자정보, 실패 시 EOF 반환
```

- putchar 함수는 전달된 문자 정보를 stdout 표준 출력 스트림으로 전송하는 함수
- fputc 함수는 문자를 전송할 스트림 지정 가능, 나머진 putchar과 동일

### 문자 입력 함수

```c
#include <stdio.h>
int getchar(void);
int fgetc(FILE *stream);
// 파일의 끝에 도달하거나 함수 호출 실패 시 EOF 반환
```

### 문자 입출력에서의 EOF

- EOF는 End Of File의 약자
- 파일 시스템에서는 파일의 끝에 도달할 때 EOF 반환
- 콘솔에서는 두 가지 조건 중 하나만 만족하더라도 반환
  - 함수 호출의 실패
  - Windows에서 ctrl + z, Linux에서 ctrl + d가 입력되는 경우

### 반환형이 int이고, int형 변수에 문자를 담는 이유

- 위 함수가 반환하는 값 중 하나인 **EOF는 -1로 정의된 상수**
- char형을 unsigned char로 처리하는 컴파일러가 있는데, 이를 통해 컴파일 된다면 양의 정수로 형 변환됨
- 그래서 올바른 값을 반환하기 위해 int 형으로 반환형을 지정

## 문자열 단위 입출력 함수

### 문자열 출력 함수

```c
#include <stdio.h>
int put(const char *s);
int fputs(const char *s, FILE *stream);
// 함수 호출 성공 시 음수가 아닌 값을, 실패 시 EOF 반환
```

- puts 함수가 호출되면 문자열 출력 후 자동으로 개행이 이뤄지지만, fputs 함수는 아님

### 문자열 입력 함수

```c
#include <stdio.h>
int gets(char *s);
int fgets(char *s, int n, FILE *stream);
// 함수 호출 성공 시 음수가 아닌 값을, 실패 시 EOF 반환
```

- gets 함수는 지정된 메모리보다 더 긴 길이의 문자열이 입력되면 할당 받지 않은 메모리 공간을 침범하여 오류를 발생 시킴
- 그래서 fgets 함수를 사용하는 것을 권장
- 문자열 끝에는 항상 개행 문자가 들어가는 것을 유의하여 길이 지정
- fget 함수는 \n을 제외시키거나 버리지 않고 문자열의 일부로 받아들이고 \n을 만날 때까지 문자열을 읽음

## 표준 입출력과 버퍼

### 표준 입출력 기반의 버퍼

- 지금 배워온 함수들을 가리켜 **표준 입출력 함수**라고 부른다.
- 이는 메모리 버퍼를 거친다.
- **메모리 버퍼는 데이터를 임시로 모아두는 메모리 공간**이다.

### 버퍼링을 하는 이유

- 버퍼링 없이 키보드가 눌릴 때마다 문자의 정보를 목적지로 이동 시키는 것보다 데이터를 묶어서 이동 시키는 것이 효율적

### 출력 버퍼를 비우는 함수

```c
#include <stdio.h>
int fflush(FILE *stream);
// 함수 호출 성공 시 0, 실패 시 EOF 반환
```

- 출력 버퍼가 비워진다는 것은 출력 버퍼에 저장된 데이터가 버퍼를 떠나서 목적지로 이동하는 것을 의미

### 입력 버퍼를 비우는 경우

- 입력 버퍼의 비워짐은 데이터의 소멸을 의미

```c
#include <stdio.h>

int main(void){
	char perID[7];
	char name[10];

	fputs("주민번호 앞 6자리 입력: ", stdout);
	fgets(perID, sizeof(perID), stdin);

	fputs("이름 입력: ", stdout);
	fgets(name, sizeof(name), stdin);

	printf("주민번호: %s \n", perID);
	printf("이름: %s \n", name):
	return 0;
}
// 실행 결과1
// 주민번호 앞 6자리 입력: 950915
// 이름 입력: 주민번호: 950915
// 이름:
// 실행 결과2
// 주민번호 앞 6자리 입력: 950709-1122345
// 이름 입력: 주민번호: 950709
// 이름: -1122345
```

- 실행 결과 1은 엔터 키로 입력된 개행 문자가 입력 버퍼에 남아있어서 fgets에 입력된 것이다.

```c
void CLearLineFromReadBuffer{
	while(getchar()!='\n');
}
```

- 위 함수를 통해서 개행 문자가 나올 때까지 입력 버퍼에 있는 문자들을 읽는다
- 입력 버퍼에 있는 문자들을 읽으면 지워진다
- \n이 읽혀질 때까지 입력 버퍼에 저장된 문자들을 지우는 함수이다.

## 입출력 이외의 문자열 관련 함수

### 문자열 길이를 반환하는 함수

```c
#include <string.h>
size_t strlen(const char *s);
// 전달된 문자열의 길이 중 널 문자를 제외하고 반환
```

- size_t len == unsigned int len과 동일
- fgets 함수 호출을 통해서 문자열을 입력 받고 싶은데, 같이 들어오는 개행 문자는 문자열에서 제외시키고 싶은 경우 자주 사용

```c
void RemoveBSN(char str[]){
	int len=strlen(str);
	str[len-1)=0;
}
// 문자열의 마지막에 위치한 개행 문자 삭제
```

### 문자열을 복사하는 함수

```c
#include <string.h>
char *strcpy(char *dest, const char *src);
char *strncpy(char *dest, const char *src, size_t n);
// 복사된 문자열의 주소 값 반환
// src의 문자열을 dest 문자열로 복사
// 연속된 숫자에서 size_t n으로 제한하여 호출할 때 null 문자를 만들어줘야 오류 발생 x
// 예시
// strncpy(strD, strS, sizeof(strD)-1);
// strD[sizeof(strD)-1]=0;
```

### 문자열을 덧붙이는 함수

```c
#include <string.h>
char *strcat(char *dest, const char *src);
char *strncat(char *dest, const char *src, size_t n);
// 덧붙여진 문자열의 주소 값 반환
```

- 덧붙임이 시작되는 위치는 널 문자 다음이 아닌 널 문자가 저장된 위치에서 시작

### 문자열을 비교하는 함수

```c
#include <string.h>
char *strcmp(char char *s1, const char *s2);
char *strncmp(char char *s1, const char *s2, size_t n);
// 두 문자열의 내용이 같으면 0, 같지 않으면 0이 아닌 값 반환
```

### 그 이외의 변환 함수들

```c
#include <stlib.h>
int atoi(const char *str); // 문자열의 내용을 int형으로 변환
long atol(const char *str); // 문자열의 내용을 double형으로 변환
float atof(const char *str); // 문자열의 내용을 float형으로 변환
```

# ch22. 구조체와 사용자 정의 자료형1

## 구조체란 무엇인가?

### 구조체의 정의

- 하나 이상의 변수(포인터 변수와 배열 포함)를 묶어서 새로운 자료형을 정의하는 도구
- 예시로, 마우스의 x, y 좌표는 연결되어 있으므로 하나로 묶어서 자료형을 생성한다고 가정

```c
struct point{
	int xpos;
	int ypos;
}
```

### 구조체 변수의 선언과 접근

```c
struct point pos; // 선언
pos.xpos-20; // 접근
```

### 구조체 변수의 초기화

- int형 변수를 선언과 동시에 초기화가 가능하듯이 구조체 변수도 동시에 가능

```c
#inclue <stdio.h>

struct point{
	int xpos;
	int ypos;
};

int main(void){
	struct point pos={10,20);
	return 0;
}
```

- 선언과 초기화를 따로 하는 경우 strcpy 함수를 호출해야 한다
- 하지만 동시에 하는 경우 데이터를 단순히 나열만 하면 된다.

## 구조체의 배열과 포인터

### 구조체 배열의 선언과 접근

- 다수의 구조체 변수를 선언할 때는 구조체 배열의 선언을 고려

```c
struct point arr[10] // 선언
scanf("%d, %d, &arr[0].xpos, &arr[0].ypos); // 접근
```

### 구조체 배열의 초기화

- 구조체 변수 여러 개를 중괄호를 이용해서 초기화

```c
struct point arr[3]={
	{1, 3},
	{2, 4},
	{3, 5}
};
```

### 구조체 변수와 포인터

```c
struct point pos={11, 12}; // 선언 및 초기화
struct point *pptr = &pos; // 포인터 변수 pptr은 구조체 변수 pos를 가리킴

(*pptr).xpos=10; // pptr이 가리키는 구조체 변수의 멤버 xpos에 10 저장
==
pptr -> xpos=10; // 위와 같은 코드
```

- 구조체 변수의 주소 값은 구조체 변수의 첫 번째 멤버의 주소 값과 동일하다.

### 포인터 변수를 구조체의 멤버로 선언하기

- TYPE형 구조체 변수의 멤버로 TYPE형 포인터 변수를 둘 수 있다.

```c
struct point{
	int xpos;
	int ypos;
	struct point *ptr; //구조체 point의 포인터 변수 선언
}
```

# ch23. 구조체와 사용자 정의 자료형2

## 구조체와 typedef

### typedef 선언

- typedef란 기존에 존재하는 자료형의 이름에 새 이름을 부여하는 것
- typedef name1 name2 name3; 는 ‘name1 name2’ 를 name3로 새로 명명하는 것
- 대문자로 시작하는 것이 관례

### typedef를 통한 구조체의 정의

```c
typedef struct point{
	int xpos;
	int ypos;
} Point;
==
struct point{
	int xpos;
	int ypos;
};
typedef struct point Point;
==
typedef struct{
	int xpos;
	int ypos;
} Point;
// 세번째 경우는 point 대신 Point로 이름지은 상황이니
// struct point pnt;와 같이 변수 설정 불가능
```

## 함수로의 구조체 변수 전달과 반환

- 구조체 변수 역시 다른 자료형 변수와 같이 함수의 인자로 사용되거나 return문을 통해 반환 가능

### 구조체 변수를 대상으로 가능한 연산

- 대입연산
- &연산 (주소 값 반환)
- sizeof 연산 (구조체 변수의 크기 반환)
- 덧셈이나 뺄셈을 하려면 함수를 새로 정의해야한다.

## 구조체의 유용함과 중첩 구조체

- 구조체를 통해서 연관 있는 데이터를 하나로 묶을 수 있는 자료형을 정의하면, 데이터의 표현 및 관리가 용이해지고 합리적인 코드 작성 가능
  - 구조체의 멤버들을 각각 따로 정의하면 다수의 배열과, 매개변수도 많이 작성해야함

## 공용체의 정의와 의미

- 구조체와 공용체는 정의하는 방식이 같다
- 하지만 메모리 공간에 할당되는 방식과 접근의 결과에 차이가 있다.
- 구조체 변수가 선언되면 구조체의 멤버는 각각 할당이 된다.
- 공용체 멤버는 각각 할당되지 않고, 크기가 가장 큰 멤버 변수 하나만 할당되어 공유한다.
- 공용체는 하나의 메모리 공간을 둘 이상의 방식으로 접근할 수 있다는 데 의의가 있다.

예시

- int형 정수를 입력 받기
- 입력 받은 정수를 상위 2바이트와 하위 2바이트 값을 양의 정수로 출력
- 상위 1바이트와 하위 1바이트에 저장된 값의 아스키 문자 출력

```c
#include <stdio.h>

typedef struct dbshort{
	unsigned short upper;
	unsigned short lower;
} DBShort;

typedef union rdbuf{
	int iBuf;
	char bBuf[4];
	DBShort sBuf;
} RDBuf;

int main(void){
	RDbuf buf;
	printf("정수 입력: ");
	scanf("%d", &(buf.iBuf));

	printf("상위 2바이트: %u \n", buf.sBuf.upper);
	printf("하위 2바이트: %u \n", buf.sBuf.lower);
	printf("상위 1바이트 아스키 코드: %c \n", buf.bBuf[0]);
	printf("상위 1바이트 아스키 코드: %c \n", buf.bBuf[3]);
	return 0;
}
```

## 열거형의 정의와 의미

- 변수에 저장이 가능한 값들을 열거하여 정의한다고 해서 ‘열거형’
- 여러가지 값들을 상수화 하는 것을 의미

```c
#include <stdio.h>

typedef enum syllable{
	Do=1, Re=2, Mi=3, Fa=4, So=5, La=6, Ti=7
} Syllable;

void Sound(Syllable sy){
	switch(sy){
		case Do;
				puts("도는 하얀 도라지"); return;
		case Re;
				puts("레는 둥근 레코드"); return;
		case Mi;
				puts("미는 파란 미나리"); return;
		case Fa;
				puts("파는 예쁜 파랑새"); return;
		case So;
				puts("솔는 작은 솔방울"); return;
		case La;
				puts("라는 라디오"); return;
		case Ti;
				puts("시는 시냇물"); return;
		}
}

int main(void){
	Syllable tone;
	for(tone=Do; tone<=Ti; tone+=1){
		Sound(tone);
	}
	return 0;
}
// Do~Ti 부분에 숫자를 넣은 것과 상수를 넣은 것과 같은 결과를 출력
```

- 열거형 상수의 값이 결정되는 방식

```c
enum color {RED, BLUE, WHITE, BLACK);
// 0부터 1씩 증가하는 형태
enum color {RED=3, BLUE, WHITE=6, BLACK};
// 빈 변수의 이전 값에서 1씩 더한 형태
```

- 열거형은 둘 이상의 연관이 있는 이름을 상수로 선언함으로써 프로그램의 가독성을 높이는 데 있다.

# ch24. 파일 입출력

## 파일과 스트림, 기본적인 파일의 입출력

- 파일의 데이터를 읽거나, 데이터를 입력하고 싶다면 스트림을 생성해야 한다.
- 스트림을 형성할 때 사용하는 함수

```c
#include <stdio.h>
FILE *fopen(const char *filename, const char *mode);
```

- 첫 번째 인자로는 스트림을 형성할 파일의 이름
- 두 번째 인자로는 형성할 스트림의 종류에 대한 정보를 문자열의 형태로 전달
  - fopen 함수가 호출되면 FILE 구조체 변수가 생성
  - FILE 구조체 변수에는 파일에 대한 정보가 담긴다
  - FILE 구조체의 포인터는 파일을 가리키는 지시자의 역할

### 입/출력 스트림의 생성

```c
FILE *fp = fopen("data.txt", "wt"); // 출력 스트림의 형성
FILE *fp = fopen("data.txt", "rt"); // 입력 스트림의 형성, 둘 다 주체는 프로그램
```

### 파일 출력 예시

```c
#inclue <stdio.h>

int main(void){
	FILE *fp = fopen("data.txt","wt");
	if(fp==NULL){
		puts("파일오픈 실패!");
		return -1;
	}
	fputc('A', fp);
	fclose(fp);
	return 0;
}
```

이 중 fclose 함수는 스트림의 소멸을 요청하는 함수

```c
#include <stdio.h>
int fclose(FILE *stream);
-> 성공 시 0, 실패 시 EOF 반환
```

fclose 함수를 통해 개방된 스트림을 닫아줘야 하는 이유는?

1. 운영체제가 할당한 자원의 반환
2. 버퍼링 되었던 데이터의 출력
   1. 파일을 닫아주면 출력 버퍼에 저장되어 있던 데이터가 파일로 이동하면서 출력 버퍼는 비워짐
   2. 스트림을 종료하지 않고 버퍼만 비우고 싶을 때는 fflush 함수를 사용

### 파일 입력 예시

```c
#inclue <stdio.h>

int main(void){
	int ch, i;
	FILE *fp = fopen("data.txt","rt");
	if(fp==NULL){
		puts("파일오픈 실패!");
		return -1;
	}

	for(i=0; i<3; i++){
	ch=fgetc(fp);
	printf("%c \n", ch);
	}
	fclose(fp);
	return 0;
}
```

## 파일의 개방 모드

1. 읽기 위한 스트림 / 쓰기 위한 스트림

   1. r / 읽기 가능
   2. w / 쓰기 가능
   3. a / 파일의 끝에 덧붙여 쓰기 가능
   4. r+ / 읽기, 쓰기 가능
   5. w+ / 읽기, 쓰기 가능
   6. a+ / 읽기, 덧붙여 쓰기 가능

   +는 읽기, 쓰기가 모두 가능한 스트림의 의미

   a는 덧붙여 쓰기가 가능한 스트림의 의미

   <aside>
   💡 웬만하면 r, w, a를 사용하는 것이 좋다. +의 경우에는 작업을 변경할 때마다 메모리 버퍼를 변경해야 하는 등의 불편함이 있다.

   </aside>

### 텍스트 파일과 바이너리 파일

- 텍스트 파일: 사람이 인식할 수 있는 문자를 담고 있는 파일 / ex) 도서의 목록, 물품 가격
- 바이너리 파일: 컴퓨터가 인식할 수 있는 데이터를 담고 있는 파일 / ex) 영상파일, 음원 파일

### 텍스트 모드와 바이너리 모드

- 개행 문자 \n의 경우 사실 줄이 바뀌었다는 현상 그 자체일 뿐 하나의 데이터로 표현하는 대상이 아니다.
- Window에선 **\r\n** / Mac에선 **\r** / Unix에선 **\n**으로 약속
- 이를 파일로 입출력 할 때 자동으로 변환하기 위해선 텍스트 모드로 파일을 개방하면 된다.
- 이는 개방 모드 + t의 형태이다
- 바이너리 데이터를 오갈 때는 바이너리 모드로 파일을 개방해야 한다.
- 이는 개방 모드 + b의 형태이다

### feof 함수 기반의 파일복사 프로그램

```c
#include <stdio.h>
int feof*(FILE *stream);
-> 파일의 끝에 도달한 경우 0이 아닌 값 반환
```

예시

```c
#include <stdio.h>

int main(void){
	FILE *src = fopen("src.txt", "rt");
	FILE *des = fopen("des.txt", "wt");
	int ch;

	if(src=NULL || des=NULL) {
		puts("파일 오픈 실패!");
		return -1;
	}

	while((ch=fgetc(src))!=EOF){
		fputc(ch, des);
	}
	// EOF를 반환할 때까지 한글자씩 읽어서 파일에 출력

	if(feof(src)!=0){
		puts("파일 복사 완료!");
	}else{
		puts("파일 복사 실패!");
	}

	fclose(src);
	fclose(des);
	return 0;
}
```

### 바이너리 데이터의 입출력

입력

```c
#include <stdio.h>
int buf[12];
fread((void*)buf, sizeof(int), 12, fp);
// sizeof(int) 크기의 데이터 12개를 fp에서 읽어 배열 buf에 저장해라
// 성공 시 전달인자 count, 실패 또는 파일의 끝 도달 시 count보다 작은 값 반환
```

출력

```c
#include <stdio.h>
int buf[7]={1, 2, 3, 4, 5, 6, 7};
fwrite((void*)buf, sizeof(int), 7, fp);
// sizeof(int) 크기의 데이터 7개를 buf에서 읽어 fp에 저장해라
// 성공 시 전달인자 count, 실패 시 count보다 작은 값 반환
```

예시

```c
#include <stdio.h>

int main(void){
	FILE *src = fopen("src.bin", "rb");
	FILE *des = fopen("des.bin", "wb");
	char buf[20];
	int readCnt;

	if(src==NULL||des==NULL){
		puts("파일오픈 실패!");
		return -1;
	}

	while(1){
		readcnt=fread((void*)buf, 1, sizeof(buf), src); //성공시 세번째 인자 반환, 실패시 작은 숫자 반환
		if(readcnt<sizeof(buf)){
			if(feof(src)!=0){
				puts("파일복사 완료");
				break;
			}else{
				puts("파일복사 실패");
				break
			}
			fwrite((void*)buf, 1, sizeof(buf), des);
	}
	fclose(src);
	fclose(des);
	return 0;
}
```

## 텍스트 데이터, 바이너리 데이터의 입출력 동시에 하기

### 서식에 따른 데이터 입출력

```c
fprintf(fp, "%s %c %d", name, sex, age);
ret = fscnaf(fp, "%s %c %d", name, sex, age);
```

- 구조체 변수도 바이너리 데이터로 인식하고 파일 입출력 가능

### 파일 위치 지시자

- 파일의 위치 정보를 저장하고 있는 FILE 구조체의 멤버

### 파일 위치 지시자의 이동

```c
#include <stdio.h>
int fseek(FILE *stream, long offset, int wherefrom);
// 성공 시 0, 실패 시 0이 아닌 값을 반환
```

- 스트림으로 전달된 파일 위치 지시자를 wherefrom에서 offset 바이트만큼 이동해라
  - wherefrom의 종류
    - SEEK_SET: 파일 맨 앞에서부터 이동을 시작
    - SEEK_CUR: 현재 위치에서부터 이동을 시작
    - SEEK_END: 파일 맨 끝에서부터 이동을 시작

### 현재 파일 위치 지시자의 위치

```c
#include <stdio.h>
long ftell(FILE *stream);
// 성공 시 0, 실패 시 0이 아닌 값을 반환
```

# ch25. 메모리 관리와 메모리의 동적 할당

## C언어의 메모리 구조

### 메모리의 구성

- 운영체제 이해서 마련되는 메모리의 구조는 4 개의 영역으로 구분한다.
- 코드 영역
  - 실행할 프로그램의 코드가 저장되는 곳으로, 명령문들을 저장
- 데이터 영역
  - 전역변수와 static 변수들 저장
- 힙 영역
  - 프로그래머가 원하는 시점에 변수를 할당 또는 소멸하는 영역
- 스택 영역
  - 지역변수와 매개변수 저장

### 운영체제에서 프로그램 실행 과정

1. 데이터 영역 초기화
   1. 전역변수, static변수 데이터 영역에 할당
2. main 함수 호출
   1. 지역변수 스택에 할당
3. return문 실행되면서 메모리 공간 전체 반환

- 스택에는 저장된 순서의 역순으로 소멸 된다.

## 메모리의 동적 할당

### 전역변수와 지역변수로 해결이 되지 않는 경우

- 함수가 매번 호출될 때마다 새롭게 할당되고 함수를 빠져나가도 유지 되는 유형의 변수

### 힙 영역의 메모리 공간 할당과 해제

```c
#include <stdlib.h>
void *malloc(size_t size);
void free(void *ptr);
// malloc 함수는 성공 시 할당된 메모리의 주소 값 반환, 실패 시 NULL 반환
```

- 힙에 할당된 메모리 공간은 malloc 함수로만 접근이 가능해서 포인터를 이용해야 함

### malloc 함수의 반환형이 void형 포인터인 이유와 힙 영역으로의 접근

```c
void *ptr = malloc(8); //이라고 작성하면 8이 int형 2개인 건지, 뭘 의미하는 건지 알 수가 없다.
int *ptr1 = (int *)malloc(sizeof(int)); // 포인터 형의 변환을 통해서 할당된 메모리 공간에 접근
```

### calloc 함수

```c
#include <stdlib.h>
void *calloc(size_t elt_count, size_t elt_size);
// 성공 시 할당된 메모리의 주소 값, 실패 시 NULL 반환
```

**malloc과 calloc의 차이점**

- malloc
  - 할당 방식: 총 120 바이트를 힙 영역에 할당
  - 할당된 메모리의 값을 쓰레기 값으로 할당
- calloc
  - 할당 방식: 4바이트 크기의 블록 30개를 힙 영역에 할당
  - 할당된 메모리의 값을 0으로 할당

### realloc 함수

- 할당된 메모리의 크기를 조정하고 싶을 때 사용

```c
int main(void){
	int *arr = (int *)malloc(sizeof(int)*3); //길이가 3인 int형 배열 할당
	arr = (int *)realloc(Arr, sizeof(int)*5); //길이가 5인 int형 배열로 확장
}
```

위 코드의 결과는 두 가지로 구분

1. malloc함수가 반환한 주소와 ralloc 함수의 주소 값이 같은 경우
   1. 확장할 영역이 넉넉한 경우
2. malloc함수가 반환한 주소와 ralloc 함수의 주소 값이 다른 경우
   1. 확장할 영역이 부족한 경우 메모리 공간을 별도로 할당

# ch26. 메모리 관리와 메모리의 동적 할당

## 선행처리기와 매크로

### 실행파일 생성 과정

- 소스파일 → **선행처리기(매크로 확장)** → 선행처리된 소스파일 → **컴파일러** → 오브젝트 파일 → **링커** → 실행파일
- 선행처리는 대부분 **단순 치환의 형태이다**

## 대표적인 선행처리 명령문

### #define: Object-like macro

```c
#define PI 3.1415
```

- define - 지시자
- PI - 매크로
- 3.1415 - 매크로 몸체
- 매크로 PI를 매크로 몸체 3.1415로 전부 치환하라는 의미
- **매크로 상수**라고 불리는 Object-like macro는 매크로와 매크로 몸체가 그 자체로 비슷한 의미이기 때문이다.

### #define: Function-like macro

```c
#define SQUARE(X) X*X
```

- SQUARE 같은 패턴 등장 시 X\*X로 치환하라
- 동작방식이 함수와 비슷하기 때문에 **매크로 함수**라고 불림

### 매크로(함수) 정의 주의사항

- 매크로의 몸체 부분을 구성하는 X와 같은 인자에도 ()를 하고, 전체도 괄호로 한 번 더 묶어준다.

### 매크로 함수의 장단점

- 장점
  - 일반 함수에 비해 실행속도 빠르다
  - 자료형에 따라 별도로 함수를 정의하지 않아도 된다
- 단점
  - 정의하기가 어렵다
  - 디버깅이 어렵다
- 결론
  - 작은 크기의 함수와 호출의 빈도수가 높은 함수에만 사용하자

## 조건부 컴파일을 위한 매크로

- #if…#endif: 참이라면
- #ifdef…#endif: 정의되었다면
- #ifndef…#endif: 정의되지 않았다면
- #else는 어디든 삽입 가능
- #elif도 어디든 삽입 가능 (else if)

## 매개변수의 결합과 문자열화

- 문자열에서는 매크로의 매개변수 치환이 발생하지 않는 문제가 발생

### #연산자

- 이를 위해서 #연산자가 있음

```c
#define STR(ABC) #ABC
```

- 매개변수 ABC에 전달되는 인자를 문자열 “ABC”로 치환하라

## ##연산자

- ##연산자의 양 옆을 이어줄 때 사용

```c
#define CON(UPP, LOW) UPP##LOW -> UPPLOW로 출력
```

# ch27. 파일의 분할과 헤더파일의 디자인

## 파일의 분할

- 컴파일러는 파일 단위로 컴파일을 진행
- 외부에 선언되었다고 알려줘야함
  - extern 명령어가 해당 역할
- 다른 파일에서 접근을 못하게 하고 싶다면 static
  - 접근의 범위를 파일의 내부로 제한하는 경우에 사용

## 헤더 파일의 디자인과 활용

### #include

- 헤더 파일의 포함을 의미하는 지시자
  - #include <헤더파일>
    - 표준 헤더 파일이 저장되어있는 디렉터리에서 찾아서 삽입
  - #inclue “헤더 파일”
    - 소스 파일이 저장된 디렉터리에서 헤더파일을 찾아서 삽입
- 구조체는 주로 헤더 파일에 선언하는 게 좋다
  - 함수나 변수는 헤더 파일을 통해 중복 삽입되어도 괜찮지만, 구조체는 실행 파일의 크기와 실행 파일의 내용이 달라질 수 있어서 중복되면 안된다.
