package beinus.backend.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import beinus.backend.dto.UserInfoResponse;

import java.util.Collection;
import java.util.Iterator;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MainApiController {

    @Operation(summary = "인증된 user 정보 불러오기", description = "JWT 토큰을 통해 인증된 사용자의 이름과 역할 정보를 반환")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 user 정보 반환했습니다."),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음")
    })

    @GetMapping("/")
    public ResponseEntity<UserInfoResponse> mainP(){

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String name = authentication.getName();
        /*
        JWT가 session을 STATELESS로 관리되지만, 잠시 1회성으로 세션이 생성되는데
        이 때 JWTFilter를 통과한 뒤의 세션을 확인할 수 있다.
         */

        System.out.println("name : " + name);

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String role = authorities.stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_USER");

        System.out.println("role : " + role);

        UserInfoResponse response = new UserInfoResponse(name, role);
        return ResponseEntity.ok(response);
//        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
//        GrantedAuthority authority = iterator.next();
//        return "Main Controller" + name + role;
    }

}


