package jpabook.jpashop.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
public class Member {
    @Id @GeneratedValue
    @Column(name = "member_id")
    private Long id;

    private String name;

    @Embedded
    private Address address;

    @OneToMany(mappedBy = "member") // order table의 member 필드에 의해 맵핑된거임.
    /*
    나는 맵핑을 하는 애가 아니고, 맵핑된 거울일 뿐이다. (값을 넣는다고 fK가 변하지 X)
    member의 입장에서 List는 일대다 관계(하나의 회원이 여러 개 주문)임.
     */
    private List<Order> orders = new ArrayList<>();

}
