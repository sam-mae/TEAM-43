package jpabook.jpashop.service;

import jpabook.jpashop.domain.UserEntity;
import jpabook.jpashop.domain.UserRole;
import jpabook.jpashop.dto.JoinDTO;
import jpabook.jpashop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class JoinService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public void joinProcess(JoinDTO joinDTO){
        String username = joinDTO.getUsername();
        String password = joinDTO.getPassword();
        String org = joinDTO.getOrg();

        // DB에 이미 동일한 username 있는지 확인
        Boolean isExist = userRepository.existsByUsername(username);
        // 이미 있다면, 종료
        if (isExist){
           return;
        }

        UserEntity userEntity = new UserEntity();
        userEntity.setUsername(username);
        userEntity.setPassword(bCryptPasswordEncoder.encode(password));

        // Org에 따라 적절한 Role 설정
        UserRole role = switch (org) {
            case "org1" -> UserRole.org1;
            case "org2" -> UserRole.org2;
            case "org3" -> UserRole.org3;
            case "org4" -> UserRole.org4;
            case "org5" -> UserRole.org5;
            case "org6" -> UserRole.org6;
            case "org7" -> UserRole.org7;
            default -> UserRole.USER_ROLE; // 기본값
        };
        userEntity.setRole(role.getAuthority()); // enum -> string으로 바꿈


        userRepository.save(userEntity);
    }
}
