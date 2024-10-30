package beinus.backend.dto;

import lombok.Getter;
import lombok.Setter;

public class AuthResponse {
    @Getter @Setter
    private String token;

    public AuthResponse(String token){
        this.token = token;
    }

}
