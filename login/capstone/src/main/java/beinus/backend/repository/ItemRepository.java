package beinus.backend.repository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import beinus.backend.domain.item.Item;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class ItemRepository {
    private final EntityManager em;

    public void save(Item item){
        if (item.getId() == null){
        /*
        item은 JPA에서 저장하기 전까지는 id 값이 없음(새로 만든 객체임).
        save를 호출하면, em.persist(item)을 해서 신규로 item을 등록하는 것.
         */
            em.persist(item);
        }
        else{
        /*
        이미 DB에 등록된 것을 어디에서 가져오는 것임.
         */
            em.merge(item);
        }
    }

    public Item findOne(Long id){
        return em.find(Item.class, id);
    }

    public List<Item> findAll(){
        return em.createQuery("select i from Item i", Item.class).getResultList();
    }
}
