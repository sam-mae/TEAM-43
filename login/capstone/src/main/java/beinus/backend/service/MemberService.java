package beinus.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import beinus.backend.domain.Member;
import beinus.backend.repository.MemberRepository;

import java.util.List;

@Service //@Component이 붙어있기 때문에, 자동으로 Spring Bean에 등록이 된다.
@Transactional(readOnly = true)
// transaction 안에서 데이터 변경하려면 @Transactional이 있어야 함
@RequiredArgsConstructor
/*
@AllArgsConstructor(lombok): 모든 필드에 대해 생성자를 만들어 줌.
public MemberService(MemberRepository memberrepository) {
        this.memberrepository = memberrepository;

}
@RequiredArgsConstructor : final이 붙은 필드에 대해서만 생성자를 만들어줌.
 */
public class MemberService {

    /* @Autowired :
        field injection : spring bean에 등록돼있는 member repository를 주입시켜줌
        -> 근데, 요새 잘 안쓰이고 생성자 주입을 많이 씀.
         */
    //
    private final MemberRepository memberrepository; // final로 바꿔주는 것이 좋음.
    // @Autowired // MemberRepository 하나만 있을 경우에는 필요 없긴 함.

    // 회원가입.
    // 기본이 readOnly=true 이기 때문에, 수정이 안된다. 따로 transactional 걸어줘야.
    @Transactional
    public Long join(Member member){
        validDuplicateMember(member); // 중복 회원 검증
        memberrepository.save(member);
        return member.getId(); // 항상 값이 있다는게 보장됨
    }

    private void validDuplicateMember(Member member) {
        List<Member> findMembers = memberrepository.findByName(member.getName());
        if (!findMembers.isEmpty()){
            throw new IllegalStateException("이미 존재하는 회원입니다.");
        }
    }

    //회원 조회(읽기에는 가급적 readOnly 옵션을 넣자.)
    public List<Member> findMembers(){
        return memberrepository.findAll();
    }

    public Member findOne(Long id){
        return memberrepository.findOne(id);
    }

    @Transactional
    public void update(Long id, String name) {
        Member member = memberrepository.findOne(id);
        //@transactional이 있는 상태에서 조회하면 영속성 컨텍스트에서 가져옴.

        member.setName(name);
        /*
        값의 이름을 파라미터 name으로 바꾸면 entity가 바뀜.
        transaction이 끝나고 commit되는 시점에 JPA가 변경감지를 수행함.
        이후, update 쿼리를 데이터베이스에 날림 -> update 끝나고 -> transaction 끝남.
         */

    }
}
