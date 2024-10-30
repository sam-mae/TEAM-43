package beinus.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import beinus.backend.domain.Member;
import beinus.backend.domain.UserEntity;
import beinus.backend.dto.CustomUserDetails;
import beinus.backend.repository.UserRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override // DB에서 특정 유저를 조회해서 return 해주면 됨.
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        UserEntity userData = userRepository.findByUsername(username); // 조회 진행

        if (userData != null) {
            return new CustomUserDetails(userData);
        }

        return null;
    }
}
