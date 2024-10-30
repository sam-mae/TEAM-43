package beinus.backend.domain;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Embeddable
@Getter
/*
값 타입은 변경 불가능하게 설계해야 한다. @Setter를 제거하고,
생성자에서 모두 초기화해서 변경 불가능한 class를 만들자.
 */
public class Address {

    private String city;
    private String street;
    private String zipcode;

    protected Address(){

    }

    public Address(String city, String street, String zipcode) {
        this.city = city;
        this.street = street;
        this.zipcode = zipcode;
    }
}
