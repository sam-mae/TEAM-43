package jpabook.jpashop.jwt;

import io.jsonwebtoken.Jwts;
import jpabook.jpashop.domain.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JWUtil {

    private final SecretKey secretKey;

    public JWUtil(@Value("${spring.jwt.secret}") String secret) {
        this.secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), Jwts.SIG.HS256.key().build().getAlgorithm());
    }

    // 검증 메서드 3개 + 로그아웃
    public String getUsername(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().get("username", String.class);
    }

    public String getRole(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().get("role", String.class);
    }

    // JWT가 refresh 인지 확인 -> payload에 담겨서 옴
    public String getCategory(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().get("category", String.class);
    }

    public Boolean isExpired(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().getExpiration().before(new Date());
    }

    // 로그인 성공 시 JWT 토큰 생성시켜서 반환

    public String createJwt(String category, String username, String role, Long expiredMs){
        return Jwts.builder() // 토큰 생성
                .claim("category", category)
                .claim("username", username) // payload에 username, role,
                .claim("role", role) // enum의 role에서 뽑아냄
                .issuedAt(new Date(System.currentTimeMillis())) // 발행시간 넣음
                .expiration(new Date(System.currentTimeMillis() + expiredMs))
                // 언제 소멸될 것인지는 현재 발행시간 + 인자로 받은 살아있는 시간
                .signWith(secretKey) // secretKey를 통해 암호화 진행
                .compact();
    }

}
