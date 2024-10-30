package beinus.backend.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import beinus.backend.domain.UserEntity;
import beinus.backend.domain.UserRole;
import beinus.backend.dto.AuthResponse;
import beinus.backend.dto.CustomUserDetails;
import beinus.backend.dto.JoinDTO;
import beinus.backend.jwt.JWUtil;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LoginApiController {

    private final AuthenticationManager authenticationManager;
    private final JWUtil jwUtil;

    @Operation(summary = "로그인", description = "사용자 로그인 성공 시 JWT 토큰 발급")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "로그인 성공 및 토큰 발급"),
            @ApiResponse(responseCode = "401", description = "로그인 실패")
    })

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody JoinDTO joinDTO){
        /*
        TODO : JoinDTO -> LoginDTO로 수정할 것.
         */
        try{
            // 인증 시도
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            joinDTO.getUsername(),
                            joinDTO.getPassword()
                    )
            );

            // CustomerDetails로부터 UserEntity를 가져온다.
            CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
            UserEntity user = customUserDetails.getUserEntity();
            String role = user.getRole();

            // 인증 성공 시 JWT 토큰 생성
            String token = jwUtil.createJwt(
                    "access",
                    user.getUsername(),
                    role,
                    1000L * 60 * 60
            );

            // 토큰을 응답으로 반환
            return ResponseEntity.ok(new AuthResponse(token));

        } catch (AuthenticationException e){
            return ResponseEntity.status(401).body("로그인 실패: 아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        catch(Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

}
