package beinus.backend.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import beinus.backend.dto.JoinDTO;
import beinus.backend.service.JoinService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class JoinApiController {

    private final JoinService joinService;

    @Operation(summary = "회원가입", description = "새로운 user의 정보를 등록")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "회원가입 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })

    @PostMapping("/join")
    public ResponseEntity<String> join(@RequestBody JoinDTO joinDTO){
        joinService.joinProcess(joinDTO);
        return ResponseEntity.ok("회원가입 성공");
    }
}
