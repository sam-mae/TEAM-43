package beinus.backend.controller;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import beinus.backend.dto.JoinDTO;
import beinus.backend.service.JoinService;

//@RestController
@Controller
@RequiredArgsConstructor
public class JoinController {

    private final JoinService joinService;

    @GetMapping("/join")
    public String joinP(){
        return "join";
    }

// JWT 토큰 전용
//    @PostMapping("/join")
//    public String joinP(JoinDTO joinDTO){
//        joinService.joinProcess(joinDTO);
//        return "ok";
//    }

    @PostMapping("/joinProc")
    public String joinProcess(JoinDTO joinDTO){
        System.out.println("아아디 : " + joinDTO.getUsername() + ", join 들어왔을 때");
        joinService.joinProcess(joinDTO);
        return "redirect:/login";
    }

}
