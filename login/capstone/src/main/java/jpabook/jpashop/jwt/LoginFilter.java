package jpabook.jpashop.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jpabook.jpashop.dto.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Collection;
import java.util.Iterator;

@RequiredArgsConstructor
public class LoginFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private final JWUtil jwUtil;

    @Override
    public Authentication attemptAuthentication(HttpServletRequest req, HttpServletResponse res)
    throws AuthenticationException {

        // 내부 클라이언트 요청에서 username과 password를 추출함
        String username = obtainUsername(req);
        String password = obtainPassword(req);

        System.out.println("1번 인증 : username = " + username);

        // username, password가 담겨있는 AuthenticationToken에게 넘겨서 검증 진행
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(username, password, null);

        // 담은 Token을 authentication manager에게 넘겨줌.
        return authenticationManager.authenticate(authToken);
        /*
        검증방법 : DB에서 회원 정보를 불러와서 UserDetailsService를 통해서
        유저 정보를 받아서 검증을 진행함.
         */
    }

    // 로그인 성공 시 여기서 JWT를 발급
    @Override
    protected void successfulAuthentication(HttpServletRequest req,
                                            HttpServletResponse res,
                                            FilterChain chain,
                                            Authentication authentication){

        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal(); // User 객체 뽑아냄
        String username = customUserDetails.getUsername();

        // role값을 뽑아냄
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();
        String category = auth.getAuthority();
        String role = auth.getAuthority();

        String token = jwUtil.createJwt(category, username, role, 60*60*10L);

        res.addHeader("Authorization", "Bearer " + token);
        // JWT를 response에 담아서 응답을 주면 됨. Header의 Key는 Authorization
    }

    //로그인 실패 시
    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest req,
                                              HttpServletResponse res,
                                              AuthenticationException failed){
        res.setStatus(401); // 로그인 실패 시 401 응답 반환
    }
}
