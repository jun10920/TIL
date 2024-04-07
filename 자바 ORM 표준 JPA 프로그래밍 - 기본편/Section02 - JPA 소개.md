# Section02 - JPA 소개

## SQL 중심적인 개발의 문제점

- 자바의 객체와 DB 테이블의 괴리 때문에 sql 쿼리를 짜기 매우 번거롭다.
  - 상속 구조 같은 경우

## JPA 소개

### JPA

- Java Persistence API
- 자바 진영의 ORM 기술 표준

### ORM

- Object-relational mapping (객체 - 관계 매핑)
  - 객체는 객체대로 설계
  - 관계형 데이터베이스는 관계형 데이터베이스대로 설계
    - ORM 프레임워크가 중간에서 매핑
- JPA는 표준 명세
  - 인터페이스의 모음
    - 이름 구현한 3가지 구현체
- 현재 대부분 Hibernate 구현체를 사용

### JPA의 장점

- SQL 중심적인 개발에서 객체 중심으로 개발
- 생산성
- 유지보수
- 패러다임의 불일치 해결
- 성능
- 데이터 접근 추상화와 벤더 독립성
- 표준

### JPA의 성능 최적화 기능

- 1차 캐시와 동일성(identity) 보장
  - 같은 트랜잭션 안에서는 같은 엔티티를 반환 - 약간의 조회 성능 향상
  - DB Isolation Level이 Read Commit이어도 애플리케이션에서 Repeatable Read 보장
- 트랜잭션을 지원하는 쓰기 지연(transactional write-behind)
  - INSERT
    - 트랜잭션을 커밋할 때까지 INSERT SQL을 모음
    - JDBC BATCH SQL 기능을 사용해서 한번에 SQL 전송
  - UPDATE
    - UPDATE, DELETE로 인한 ROW락 시간 최소화
    - 트랜잭션 커밋 시 UPDATE, DELETE SQL 실행하고 바로 커밋
- 지연 로딩(Lazy Loading)
  - 지연 로딩
    - 객체가 실제 사용될 때 로딩
  - 즉시 로딩
    - JOIN SQL로 한번에 연관된 객체까지 미리 조회

**객체와 테이블을 생성하고 매핑**

- @Entity
  - JPA가 관리할 객체
- @Id
  - 데이터베이스 PK와 매핑

**주의사항**

- 엔티티 매니저 팩토리는 하나만 생성해서 애플리케이션 전체에 공유
- 엔티티 매니저는 쓰레드 간에 공유 X
- JPA의 모든 데이터 변경은 트랜잭션 안에서 실행

JPQL

- JPA를 사용하면 엔티티 객체를 중심으로 개발
- 검색할 때도 테이블이 아닌 엔티티 객체를 대상으로 검색
- JPA가 SQL을 추상화한 JPQL이라는 객체 지향 쿼리 언어 제공
  - JPQL - 엔티티 객체를 대상으로 쿼리
  - SQL - 데이터베이스 테이블을 대상으로 쿼리
