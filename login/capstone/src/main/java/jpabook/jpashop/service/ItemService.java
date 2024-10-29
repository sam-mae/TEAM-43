package jpabook.jpashop.service;

import jpabook.jpashop.domain.item.Book;
import jpabook.jpashop.domain.item.Item;
import jpabook.jpashop.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ItemService {
    private final ItemRepository itemRepository;

    @Transactional // 기본이 readOnly 이므로 기본적으로 transactional이 있어야 함
    public void saveItem(Item item){
        itemRepository.save(item);
    }

    @Transactional
    // 준영속성 엔티티를 변경감지 방법으로 update 하는 방법
    public void updateItem(Long itemId, String name, int price, int stockQuantity){
        Item findItem = itemRepository.findOne(itemId);
        // findItem은 id를 기반으로 실제 DB에 있는 영속 상태의 엔티티임.

        findItem.setName(name);
        findItem.setPrice(price);
        findItem.setStockQuantity(stockQuantity);
        /*
        bookParam을 기반으로 세팅함. 이후 @Transactional에 의해 transaction이
        commit됨. -> commit 되면 JPA는 영속성 엔티티 중 변경된 애를 찾음.
        -> 바뀐 값으로 update code를 DB에 flush함.
         */
    }

    public List<Item> findItems(){ return itemRepository.findAll(); }

    public Item findOne(Long id){ return itemRepository.findOne(id); }
}
