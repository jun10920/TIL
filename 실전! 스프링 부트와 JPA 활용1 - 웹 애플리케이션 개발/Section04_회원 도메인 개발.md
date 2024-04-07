## 회원 리포지토리 개발

**회원 리포지토리**

```java
package jpabook.jpashop.repository;

@Repository
public class MemberRepository {

    @PersistenceContext
    private EntityManager em;

    public void save(Member member) {
        em.persist(member);
    }

    public Member findOne(Long id) {
        return em.find(Member.class, id);
    }

    public List<Member> findAll() {
        return em.createQuery("select m from Member m", Member.class)
                .getResultList();
    }

    public List<Member> findByName(String name) {
        return em.createQuery("select m from Member m where m.name = :name", Member.class)
                .setParameter("name", name)
                .getResultList();
    }
}

```

**기술 설명**

- **@Repository**
  - 스프링 빈으로 등록, JPA 예외를 스프링 기반 예외로 예외 변환
- **@PersistenceContext**
  - 엔티티 매니저(EntityManager) 주입
- **@PersistenceUnit**
  - 엔티티 매니저 팩토리(EntityManagerFactory) 주입

## 회원 서비스 개발

**회원 서비스 코드**

```java
package jpabook.jpashop.service;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor // final이 붙어 있는 필드의 생성자를 자동 생성하는 애노테이션
public class MemberService {

    private final MemberRepository memberRepository;

    @Transactional
    public Long join(Member member) {
        validateDuplidcateMember(member); //중복 회원 검증
        memberRepository.save(member);
        return member.getId();
    }

    private void validateDuplidcateMember(Member member) {
        List<Member> findMembers = memberRepository.findByName(member.getName());
        if (!findMembers.isEmpty()) {
            throw new IllegalStateException("이미 존재하는 회원입니다.");
        }
    }

    //회원 전체 조회
    public List<Member> findMembers() {
        return memberRepository.findAll();
    }

    public Member findOne(Long memberId) {
        return memberRepository.findOne(memberId);
    }
}
```

**기술 설명**

- `@Service`
- `@Transactional`
  - 트랜잭션, 영속성 컨텍스트
  - `readOnly=true`
    - 데이터의 변경이 없는 읽기 전용 메서드에 사용
    - 영속성 컨텍스트를 플러시 하지 않으므로 약간의 성능 향상(읽기 전용에는 다 적용)
    - 데이터베이스 드라이버가 지원하면 DB에서 성능 향상
- `@Autowired`
  - 생성자 Injection 많이 사용, 생성자가 하나면 생략 가능

**기능 설명**

- join()
- findMembers()
- findOne()
- 참고사항
  - 실무에서는 검증 로직이 있어도 멀티 쓰레드 상황을 고려해서 회원 테이블의 회원명 컬럼을 유니크 제약 조건을 추가하는 것이 안전
  - 스프링 필드 주입 대신에 생성자 주입을 사용

**필드 주입**

```java
public class MemberService {
    @Autowired
		MemberRepository memberRepository;
    ...
}
```

**생성자 주입**

```java
public class MemberService {

		private final MemberRepository memberRepository;

		public MemberService(MemberRepository memberRepository) {
				this.memberRepository = memberRepository;
    }
    ...
}
```

- 생성자 주입 방식을 권장
  - 변경 불가능한 안전한 객체 생성 가능
  - 생성자가 하나면, @Autowired를 생략할 수 있다.
- final 키워드를 추가시 컴파일 시점에 memberRepository를 설정하지 않는 오류를 체크 가능

**lombok**

```java
@RequiredArgsConstructor
public class MemberService {

		private final MemberRepository memberRepository;
    ...
}
```

- 스프링 데이터 JPA를 사용하면 EntityManager도 주입 가능

```java
@Repository
@RequiredArgsConstructor
public class MemberRepository {

		private final EntityManager em;
    ...
}
```

## 회원 기능 테스트

**테스트 요구사항**

- 회원가입을 성공
- 회원가입 할 때 같은 이름이 있으면 예외가 발생

**회원가입 테스트 코드**

```java
package jpabook.jpashop.service;

import jpabook.jpashop.domain.Member;
import jpabook.jpashop.repository.MemberRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.Assert.*;

@RunWith(SpringRunner.class) @SpringBootTest // springboot intergration용
@Transactional // 롤백용
public class MemberServiceTest {

    @Autowired
    MemberService memberService;

    @Autowired
    MemberRepository memberRepository;

    @Test
    public void 회원가입() throws Exception {
        //given
        Member member = new Member();
        member.setName("kim");

        //when
        Long saveId = memberService.join(member);

        //then
        assertEquals(member, memberRepository.findOne(saveId));
    }

    @Test(expected = IllegalStateException.class)
    public void 중복_회원_예외() throws Exception {
        //given
        Member member1 = new Member();
        member1.setName("kim");

        Member member2 = new Member();
        member2.setName("kim");

        //when
        memberService.join(member1);
        memberService.join(member2); // 예외 발생

        //then
        fail("예외가 발생해야 한다.");
    }

}
```

**기술 설명**

- @RunWith(SpringRunner.class)
  - 스프링과 테스트 통합
- @SpringBootTest
  - 스프링 부트 띄우고 테스트(이게 없으면 @Autowired 다 실패)
- @Transactional
  - 반복 가능한 테스트 지원, 각각의 테스트를 실행할 때마다 트랜잭션을 시작하고 테스트가 끝나면 트랜잭션을 강제로 롤백

**기능 설명**

- 회원가입 테스트
- 중복 회원 예외처리 테스트

### 테스트 케이스를 위한 설정

- 격리된 환경에서 실행
- 끝나면 데이터 초기화 권장
  - 메모리 DB 사용이 이상적
  - 이를 위해서 테스트요 설정 파일을 resources 폴더에 추가

**test/resources/application.yml**

```java
spring:
#  datasource:
#    url: jdbc:h2:mem:testdb
#    username: sa
#    password:
#    driver-class-name: org.h2.Driver

#  jpa:
#    hibernate:
#      ddl-auto: create
#    properties:
#      hibernate:
#        show_sql: true
#        format_sql: true
#    open-in-view: false

logging.level:
org.hibernate.SQL: debug
#  org.hibernate.type: trace
```

- **스프링 기본 설정**
  - 메모리 DB 사용
  - driver-class도 드록된 라이브러리 확인 후 찾아준다
  - ddl-aut: create-drop 모드 동작
