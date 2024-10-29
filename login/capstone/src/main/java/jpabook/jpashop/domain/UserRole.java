package jpabook.jpashop.domain;

import lombok.Getter;

@Getter
public enum UserRole{
    org1,
    org2,
    org3,
    org4,
    org5,
    org6,
    org7,
    USER_ROLE;

    public String getAuthority(){
        return name();
    }
}
