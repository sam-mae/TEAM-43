package beinus.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsMvcConfig implements WebMvcConfigurer {

    /*
    모든 Controller 경로에 대해서 localhost:3000에서 요청을 허용해줌
    -> React 등에서 web 띄우고 브라우저 단에서 요청 시 문제를 겪지 않기 위함
     */
    @Override
    public void addCorsMappings(CorsRegistry corsRegistry) {
        corsRegistry.addMapping("/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:3001") // 프론트엔드 주소
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
