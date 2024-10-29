package jpabook.jpashop;

import org.springframework.ui.Model;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@Controller
@ResponseBody
public class AdminController {

//    @GetMapping("hello")
//    public String hello(Model model){
//        model.addAttribute("data", "hello");
//        /*
//        model을 통해 controller에서 view로 data를 실어서 넘길 수 있다.
//        key : data, value : "hello"를 넘길 것이다.
//         */
//        return "hello"; // return은 화면 이름임.
//    }

    @GetMapping("/admin")
    public String adminP(){
        return "Admin Controller";
    }

}
