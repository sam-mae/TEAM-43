package beinus.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Schema(description = "회원가입 요청 데이터")
public class JoinDTO {
    @Schema(description = "사용자 이름", example = "user")
    private String username;

    @Schema(description = "사용자 비밀번호", example = "1234")
    private String password;

    private String org; // 추가된 필드
}
