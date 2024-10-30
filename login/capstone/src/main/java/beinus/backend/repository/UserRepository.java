package beinus.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import beinus.backend.domain.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, Integer> {

    Boolean existsByUsername(String username);
    // username을 받아서 DB table에서 회원을 조회하는 메서드
    //=======================================//

    UserEntity findByUsername(String username);

}
