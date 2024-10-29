package jpabook.jpashop.config;

import jakarta.servlet.http.HttpServletRequest;
import jpabook.jpashop.jwt.JWTFilter;
import jpabook.jpashop.jwt.JWUtil;
import jpabook.jpashop.jwt.LoginFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthenticationConfiguration authenticationConfiguration;
    private final JWUtil jwUtil;

    @Bean // authenticationManager 주입받기 위함
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
    // security로 회원 정보 저장하고, 회원가입, 검증할 때에는 비번을 캐시로 암호화해서
    // 검증함. -> Bean으로 등록하면 암호화 등록 시 사용 가능하게 됨.

        return new BCryptPasswordEncoder();
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // cors 설정 -> LoginFilter가 CORS 문제에서 벗어나도록 설정.

        http
                .cors((cors) -> cors
                        .configurationSource(request -> {

                            CorsConfiguration configuration = new CorsConfiguration();
                            // 3000번대 포트 허용
                            configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:3001"));
                            // 모든 메서드 허용
                            configuration.setAllowedMethods(Collections.singletonList("*"));
                            // 프론트에서 넘어오는 credential true로
                            configuration.setAllowCredentials(true);
                            // 허용할 헤더, 허용할 시간
                            configuration.setAllowedHeaders(Collections.singletonList("*"));
                            configuration.setMaxAge(3600L);

                            // (프론트)클라이언트 단으로 header 보낼 때 Authorization Header 허용
                            configuration.setExposedHeaders(Collections.singletonList("Authorization"));

                            return configuration;
                        }));


// 경로별 인가 작업
        http
                .authorizeHttpRequests((auth) -> auth
                        .requestMatchers("/", "/login", "/join").permitAll() // login, join에 대해선 모든 권한 허용
                        //  "/loginProc","/joinProc"
                        .requestMatchers("/api/**", "/swagger-ui/**", "/swagger-resources/**", "/v3/api-docs/**").permitAll() // API 경로에 대한 접근 설정
                        .requestMatchers("/admin").hasRole("ADMIN") // admin은 권한 있는 사람만
                        .requestMatchers("/my/**").hasAnyRole("ADMIN", "USER")

                        /* ORG1~ORG7에 대해 각각 specific role을 추가
                        .requestMatchers("/viewBattery/").hasAnyRole("ORG1", "ORG3") // ORG1과 ORG3만 접근 가능
                         */
                        .anyRequest().authenticated()); // 다른 요청에 대해서는 로그인한 사용자만 들어갈 수 있도록.



        // JWT를 통한 로그인이기에, form 로그인과 http basic 인증 방식 disable
        http
                  .formLogin((auth) -> auth.disable());


        /*
        csrf(Cross-Site Request Forgery) 비활성화
        : 요청을 위조하여 사용자가 원하지 않아도 서버측으로 특정 요청을 강제로 보내는 방식
         */

        // : session을 방어하지 않아도 되기 때문에 disable 시킴
        //   배포의 경우, csrf.disable() 진행하지 않으면 자동으로 enable 설정됨
        // enable 설정 시 CsrfFilter를 통해 POST, PUT, DELETE 요청에 토큰 검증 진행
        http
                .csrf((auth) -> auth.disable());

        http
                  .httpBasic((auth) -> auth.disable());

        // 로그인 필터 앞에 JWTFilter를 넣어줌.
        http
                .addFilterBefore(new JWTFilter(jwUtil), LoginFilter.class);

        // UserNameAuthenticationFilter를 커스터마이징,
        http
                .addFilterAt(new LoginFilter(authenticationManager(authenticationConfiguration), jwUtil), UsernamePasswordAuthenticationFilter.class);


        // 세션 설정 (JWT는 항상 session을 state-less로 관리함), 가장 중요.
        http
                .sessionManagement((session) -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();

    }
}


/*
  JWT 세션을 이용하는 방식이 아닌, form login을 이용하는 경우 :
   // ** -> login page (ver.2; form 사용)
          http
                  .formLogin((auth) -> auth.loginPage("/login")
                          .loginProcessingUrl("/loginProc")
                          .defaultSuccessUrl("/p", true) // 로그인 성공 후 main으로
                          .permitAll()
                  );

   ------------------------------------------------

   // 동일한 아이디로 다중 로그인 진행 시 세션 설정
          http
                  .sessionManagement((auth) -> auth // 메서드를 통해 설정 진행
                  .maximumSessions(1) // 최대 허용 다중 로그인 횟수 : 1
                  .maxSessionsPreventsLogin(true) // 횟수 초과 시 새로운 로그인 차단
                  .and()
                  .sessionFixation().changeSessionId());

   -------------------------------------------------

   /*
        //GET 방식 로그아웃 설정
        http
                .logout((auth)-> auth.logoutUrl("/logout")
                        .logoutSuccessUrl("/"));
 */
