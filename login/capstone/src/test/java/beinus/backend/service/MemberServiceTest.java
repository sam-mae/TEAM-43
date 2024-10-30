package beinus.backend.service;

import jakarta.persistence.EntityManager;

import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import beinus.backend.domain.Member;
import beinus.backend.repository.MemberRepository;

import static org.junit.jupiter.api.Assertions.*;

@RunWith(SpringRunner.class)
@SpringBootTest // spring boot를 띄운 상태로 test를 하려면 필요하다.
@Transactional // data를 변경해야 하기에 필요, Test에 있으면 자동으로 롤백(DB에서 버림)해버림.
// 즉, insert query 문이 안보일 것임. DB에 영속성 컨텍스트가 flush할 필요가 없기 때문에.
class MemberServiceTest {

    @Autowired MemberService memberService;
    @Autowired MemberRepository memberRepository;
    // insert 문 날리는 거 보고 싶다면 1 : @Autowired EntityManager em;

    @Test
    public void 회원가입() throws Exception{
        //given
        Member member = new Member(); // Member 만들고
        member.setName("kim");
        // when
        Long savedId = memberService.join(member);

        // then
    // insert 문 날리는 거 보고 싶다면 2 : em.flush();
        assertEquals(member, memberRepository.findOne(savedId));
        /*
        join을 통해서 나온 id를 통해 찾은 회원이나 member에 추가시킨 회원이랑 같으면
        회원가입이 정상적으로 진행된 것.
        가능한 이유 : @Transactional 때문.
        같은 transaction 안에서 id(PK)값이 똑같으면 같은 persistence context 안에서
        똑같은 애가 관리가 됨.
         */
     }
     
     @Test
     public void 중복_회원_예외() throws Exception{
         //given
         Member member1 = new Member();
         member1.setName("kim");

         Member member2 = new Member();
         member2.setName("kim");
         // when
         memberService.join(member1);

         try{
             memberService.join(member2); // 1과 2 모두 동일한 이름으로 exception이 터져야 함.
         } catch (IllegalStateException e){
             return;
         }

         // then
         fail("예외가 발생해야 함"); // 여기까지 오면 안되는거임.
      }

}