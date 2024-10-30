package beinus.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

import beinus.backend.domain.item.Item;

@Entity
@Getter @Setter
public class Category {

    @Id @GeneratedValue
    @Column(name = "category_id")
    private Long id;

    private String name;

    /*
    다대다 관계는 반드시 다대일, 일대다 관계로 풀어야 함. -> 실전에서는 거의 안 씀.
    category_item 테이블이 중간에서 category_id와 item_id를 모두 FK로 가짐.
     */
    @ManyToMany
    @JoinTable(name="category_item",
        joinColumns = @JoinColumn(name="category_id"), // 중간 테이블에 있는 category_id
        inverseJoinColumns = @JoinColumn(name="item_id")) // 중간 테이블에 아이템 쪽으로 들어가는 item_id
    private List<Item> items = new ArrayList<>();

    /*
    아래는 셀프로 양방향의 연관관계를 건 것임. 부모는 ManyToOne, 아이는 OneToMany
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent")
    private List<Category> child = new ArrayList<>();

    //==연관관게 메서드==//
    public void addChildCategory(Category child){
        this.child.add(child);
        child.setParent(this);
    }

}
