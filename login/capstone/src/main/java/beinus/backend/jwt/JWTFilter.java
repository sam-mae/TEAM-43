package beinus.backend.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import beinus.backend.domain.UserEntity;
import beinus.backend.dto.CustomUserDetails;

import java.io.IOException;
import java.io.PrintWriter;

@RequiredArgsConstructor
public class JWTFilter extends OncePerRequestFilter {

    private final JWUtil jwUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");

        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.split(" ")[1];

            if (jwUtil.isExpired(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            // Assuming no need for separate access header
            String username = jwUtil.getUsername(token);
            String role = jwUtil.getRole(token);

            UserEntity userEntity = new UserEntity();
            userEntity.setUsername(username);
            userEntity.setPassword("temp_password");
            userEntity.setRole(role);

            CustomUserDetails customUserDetails = new CustomUserDetails(userEntity);
            Authentication authToken = new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authToken);
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }

        filterChain.doFilter(request, response);
    }
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
//
//        //request로부터 Authorization Header를 찾는다.
//        String authorization = request.getHeader("Authorization");
//
//        // Header에서 access 키에 담긴 Token을 꺼냄
//        String accessToken = request.getHeader("access");
//
//        // Authorization header 검증
//        if (authorization != null && authorization.startsWith("Bearer ")) {
//            // Bearer 다음 띄어쓰기 제거 후 순수 토큰(2번째)만 얻음
//            String token = authorization.split(" ")[1];
//
//            // 토큰 소멸 시간 검증
//            if (jwUtil.isExpired(token)){
//                System.out.println("token expired");
//                filterChain.doFilter(request, response);
//
//                // 조건이 해당되면 메서드 종료
//                return;
//            }
//            else{
//                // access token이 빈 문자열인 경우
//                if (accessToken == null || accessToken.isEmpty()){
//                    System.out.println("access token is empty");
//                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//                    return;
//                }
//
//                // 토큰이 access인지 확인 (payload에 명시)
//                String category = jwUtil.getCategory(accessToken);
//                if (!category.equals("access")){
//                    // responseBody
//                    PrintWriter writer = response.getWriter();
//                    writer.println("invalid access token");
//
//                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//                    return;
//                }
//
//                // 여기까지 오면 JWT 토큰 검증 완료
//                // token에서 username, role 정보 가져옴
//                String username = jwUtil.getUsername(token);
//                String role = jwUtil.getRole(token);
//
//                // User Entity 객체에 값들을 초기화 시켜줌. pw는 token에 담기지 않았지만,
//                // 같이 초기화를 시켜주어야 함. -> 매번 DB에서 조회 안하기 위해 임시 pw 사용.
//                UserEntity userEntity = new UserEntity();
//                userEntity.setUsername(username);
//                userEntity.setPassword("temp_password"); // 임시 비밀번호
//                userEntity.setRole(role);
//
//                // UserDetails에 회원 정보 객체 담기
//                CustomUserDetails customUserDetails = new CustomUserDetails(userEntity);
//
//                // Spring Security Authentication Token 생성
//                Authentication authToken = new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());
//
//                // authToken을 securityContextHolder에 담으면 지금 요청에 대해
//                // user Session을 생성할 수 있음. -> 특정한 경로에 접근 가능.
//                SecurityContextHolder.getContext().setAuthentication(authToken);
//
//                // 메서드 종료되었기 때문에 그 다음 filter에게 (res, rep) 전달해줌
//                filterChain.doFilter(request, response);
//            }
//
//            // 조건이 해당되면 메서드 종료
//            //return;
//        } else{
//            System.out.println("token null");
//            filterChain.doFilter(request, response); // 다음 filter에게 (req, res) 넘김
//        }
//    }
}
