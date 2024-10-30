package beinus.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        // Authorization 보안 스키마 정의 (Authorization 헤더)
        SecurityScheme authorizationScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP) // HTTP 타입
                .scheme("bearer") // Bearer 토큰 방식
                .bearerFormat("JWT") // Bearer 형식은 JWT
                .in(SecurityScheme.In.HEADER) // 헤더에 토큰을 포함
                .name("Authorization"); // 헤더 이름: Authorization

        // Access 보안 스키마 정의 (Access 헤더)
        SecurityScheme accessScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .name("access"); // 헤더 이름: access

        // 보안 요구사항 정의 (Authorization 및 Access 헤더)
        SecurityRequirement securityRequirement = new SecurityRequirement()
                .addList("Authorization") // Authorization 헤더 요구사항
                .addList("access"); // Access 헤더 요구사항

        // OpenAPI 객체 생성 및 설정
        return new OpenAPI()
                .components(new Components()
                        .addSecuritySchemes("Authorization", authorizationScheme) // Authorization 보안 스키마 추가
                        .addSecuritySchemes("access", accessScheme)) // Access 보안 스키마 추가
                .security(Arrays.asList(securityRequirement)); // 보안 요구사항 추가
    }
}
