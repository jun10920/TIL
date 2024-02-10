# 그래프 탐색 알고리즘

- 탐색이란 많은 양의 데이터 중에서 원하는 데이터를 찾는 과정을 의미
- 대표적인 그래프 탐색 알고리즘으로는 DFS / BFS 존재

## 스택

```python
# 파이썬에서 스택 구현 예제
# 리스트로 바로 구현 가능

#삽입(5) - 삽입(2) - 삽입(3) - 삽입(7) - 삭제() - 삽입(1) - 삽입(4) - 삭제()
stack = []

stack.append(5)
stack.append(3)
stack.append(7)
stack.pop()
stack.append(1)
stack.append(4)
stack.pop()

print(stack[::-1]) #역순/최상단 요소부터 출력
print(stack) #최하단 요소부터 출력
```

## 큐

```python
# 파이썬에서 큐 구현 예제
# 리스트로 구현 할 수 있지만 덱 라이브러리를 이용해서 사용

#삽입(5) - 삽입(2) - 삽입(3) - 삽입(7) - 삭제() - 삽입(1) - 삽입(4) - 삭제()

from collections import deque
queue = deque()

queue.append(5)
queue.append(2)
queue.append(3)
queue.append(7)
queue.popleft()
queue.append(1)
queue.append(4)
queue.popleft()

print(queue) #먼저 들어온 순서부터 출력
queue.reverse()
print(queue) #늦게 들어온 순서부터 출력
```

## 재귀 함수

- 의도적으로 무한 루프를 이용하는 것이 아니라면 재귀 함수의 종료 조건을 반드시 명시
- 모든 재귀함수와 반복문은 서로 교차 구현이 가능하다
- 재귀 함수가 유리한 경우도 있고 반복문이 유리한 경우도 있다.
- 컴퓨터가 함수를 연속적으로 호출하면 컴퓨터 내부의 스택 프레임에 쌓인다.
  - 그래서 스택을 사용해야 할 때 스택 라이브러리 대신에 재귀 함수를 이용하는 경우도 많다.

```python
# 종료 조건을 포함한 재귀 함수 예제
def recursive_function(i):
	# 100번쨰 호출을 했을 때 종료되도록 종료 조건 명시
	if i == 100:
			return
	print(i, '번째 재귀함수에서', i+1, '번째 재귀함수를 호출합니다.')
	recursive_function(i+1)
	print(i, '번째 재귀함수를 종료합니다.')

	recursive_function(1)
```

### 팩토리얼 구현 예제

```python
# 반복적으로 구현한 경우
def factorial_iterative(n):
	result = 1
# 1부터 n까지의 수를 차례대로 곱하기
	for i in range(1, n+1):
		result *= i
	return result

# 재귀적으로 구현한 경우
def factorial_recursive(n):
  if n <= 1:
    return 1
  return n*factorial_recursive(n-1)
```

### 최대공약수 계산 (유클리드 호제법) 예제

- 유클리드 호제법
  - 두 자연수 A, B(A>B)에 대하여 A / B를 나눈 나머지를 R이라고 할 때,
  - A, B의 최대공약수는 B와 R의 최대 공약수와 같다는 법칙
  - 이를 재귀 함수로 작성 가능
- GCD (Greatest Common Divisor)
  - 192와 162의 최대 공약수 구하는 과정

```python
# 유클리드 호제법
def gcd(a,b):
	if a % b == 0:
		return b
	else:
		return gcd(b, a % b)

print(gcd(192, 162))
```

## DFS (Depth-First Search)

1. 탐색 시작 노드를 스택에 삽입하고 방문 처리를 한다.
2. 스택의 최상단 노드에 방문하지 않은 인접한 노드가 하나라도 있으면 그 노드를 스택에 넣고 방문 처리한다. 방문하지 않은 인접 노드가 없으면 스택에서 최상단 노드를 꺼낸다.
3. 2번의 과정을 수행할 수 없을 때까지 반복한다.

### 동작 예시

```python
DFS 메서드 정의
def dfs(graph, v, visited):
# 현재 노드를 방문 처리
	visited[v] = True
	print(v, end=' ')
# 현재 노드와 연결된 다른 노드를 재귀적으로 방문
	for i in graph[v]:
		if not visited[i]:
			dfs(graph, i, visited)
```

```python
# 각 노드가 연결된 정보를 표현 (2차원 리스트)
graph = [
	[], #일반적으로 노드가 1부터 시작하는 경우가 많아서 0번 인덱스는 비워둔다
	[2, 3, 8],
	[1, 7],
	[1, 4, 5],
	[3, 5],
	[3, 4],
	[7],
	[2, 6, 8],
	[1, 7]
]
# 각 노드가 방문된 정보를 표현 (1차원 리스트)
visited = [False] * 9 #마찬가지로 1~8번 노드만 사용하고 0번은 사용하지 않기 위해서 9개
# 정의된 DFS 함수 호출
dfs(graph, 1, visited)
```

## BFS (Breadth-First Search)

- 큐 자료구조를 이용

1. 탐색 시작 노드를 큐에 삽입하고 방문 처리를 한다.
2. 큐에서 노드를 꺼낸 뒤에 해당 노드의 인접 노드 중에서 방문하지 않은 노드를 모두 큐에 삽입하고 방문 처리한다.
3. 더 이상 2번의 과정을 수행할 수 없을 때까지 반복한다.

### 동작 예시

```python
# BFS 메서드 정의
from collections import deque

def bfs(graph, start, visited):
	queue = deque([start])
	# 현재 노드를 방문 처리
	visited[start] = True
	#큐가 빌 때 까지 반복
	while queue:
		# 큐에서 하나의 원소를 뽑아 출력하기
		v = queue.popleft()
		print(v, end=' ')
		# 아직 방문하지 않은 인접한 원소들을 큐에 삽입
		for i in graph[v]:
			if not visited[i]:
				queue.append(i)
				visited[i] = True
```

```python
# 각 노드가 연결된 정보를 표현 (2차원 리스트)
graph = [
	[], #일반적으로 노드가 1부터 시작하는 경우가 많아서 0번 인덱스는 비워둔다
	[2, 3, 8],
	[1, 7],
	[1, 4, 5],
	[3, 5],
	[3, 4],
	[7],
	[2, 6, 8],
	[1, 7]
]
# 각 노드가 방문된 정보를 표현 (1차원 리스트)
visited = [False] * 9 #마찬가지로 1~8번 노드만 사용하고 0번은 사용하지 않기 위해서 9개
# 정의된 BFS 함수 호출
bfs(graph, 1, visited)
```

## <문제> 음료수 얼려 먹기

```python
import sys

sys.stdin = open("input.txt")
input= sys.stdin.readline

# dfs로 특정 노드를 방문하고 연결된 모든 노드들도 방문
def dfs(x, y):
  #주어진 범위를 벗어나는 경우에는 즉시 종료
  if x <= -1 or x>=n or y<=-1 or y>= m:
    return False
  # 현재 노드를 아직 방문하지 않았다면
  if graph[x][y] == 0:
    #해당 노드 방문 처리
    graph[x][y] = 1
    #상, 하, 좌, 우의 위치들도 모두 재귀적으로 호출
    dfs(x-1,y)
    dfs(x,y-1)
    dfs(x+1,y)
    dfs(x,y+1)
    return True
  return False

n, m = map(int, input().split())

# 2차원 리스트의 맵 정보 입력 받기
graph = []
for i in range(n):
  graph.append(list(map(int, input().strip())))

# 모든 노드(위치)에 대하여 음료수 채우기
result = 0
for i in range(n):
  for j in range(m):
    #현재 위치에서 DFS 수행
    if dfs(i, j) == True:
      result +=1

print(result)
```

## <문제> 미로 탈출

```python
import sys

sys.stdin = open("input.txt")
input= sys.stdin.readline

from collections import deque

n,m = map(int, input().split())
# 2차원 리스트의 맵 정보 입력 받기
graph = []
for i in range(n):
  graph.append(list(map(int, input().rstrip())))

#이동할 네 가지 방향 정의 (상, 하, 좌, 우)
dx = [-1, 1, 0, 0]
dy = [0, 0, -1, 1]

def bfs(x,y):
  queue = deque()
  queue.append((x,y))
  # 큐가 빌 때까지 반복하기
  while queue:
    x, y = queue.popleft()
    # 현재 위치에서 4가지 방향으로의 위치 확인
    for i in range(4):
      nx = x + dx[i]
      ny = y + dy[i]
      #미로 찾기 공간을 벗어난 경우 무시
      if nx < 0 or nx >=n or ny < 0 or ny >= m:
        continue
      # 벽인 경우 무시
      if graph[nx][ny] == 0:
        continue
      # 해당 노드를 처음 방문하는 경우에만 최단 거리 기록
      if graph[nx][ny] == 1:
        graph[nx][ny] = graph[x][y] + 1
        queue.append((nx, ny))
  # 가장 오른쪽 아래까지의 최단 거리 반환
  return graph[n-1][m-1]

print(bfs(0,0))
```
