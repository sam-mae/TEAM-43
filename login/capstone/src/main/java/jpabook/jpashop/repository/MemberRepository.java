package jpabook.jpashop.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jpabook.jpashop.domain.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository // Spring Bean으로 등록을 해 줌(Component scan의 대상이 됨)
@RequiredArgsConstructor // repository에서도 생성자 인젝션할 수 있다.
public class MemberRepository {

    // @PersistenceContext : JPA의 em를 주입시켜줌. -> @Autowired 써도 됨.
    private final EntityManager em;

    public void save(Member member){
        em.persist(member);
        /*
        1. persist 하면 영속성(persistence) context에 멤버 객체를 넣음.
        2. transaction이 commit 되는 시점에 DB에 반영됨.
        3. DB에 INSERT query가 날라가는 것임.
         */
    }

    public Member findOne(Long id){
        return em.find(Member.class, id); // 단건조회 (Type, PK)
    }

    public List<Member> findAll(){
        return em.createQuery("select m from Member m", Member.class)
                .getResultList();
        /*
        JPQL은 SQL과 살짝 다르다. SQL은 TABLE을 대상으로 QUERY를 하는데,
        JPQL은 ENTITY 객체를 대상으로 QUERY를 함
         */
    }

    public List<Member> findByName(String name){
        return em.createQuery("select m from Member m where m.name= :name", Member.class)
                .setParameter("name", name)
                .getResultList();
    }
    /*
    parameter binding 해서 특정 이름에 의한 회원만 잡는 기능.
     */


}
