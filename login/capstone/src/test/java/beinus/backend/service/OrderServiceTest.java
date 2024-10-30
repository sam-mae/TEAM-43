package beinus.backend.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.transaction.annotation.Transactional;

import beinus.backend.domain.Address;
import beinus.backend.domain.Member;
import beinus.backend.domain.Order;
import beinus.backend.domain.OrderStatus;
import beinus.backend.domain.item.Book;
import beinus.backend.domain.item.Item;
import beinus.backend.exception.NotEnoughStockException;
import beinus.backend.repository.OrderRepository;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@Transactional
class OrderServiceTest {

    @PersistenceContext
    EntityManager em;
    @Autowired private OrderService orderService;
    @Autowired private OrderRepository orderRepository;

    @Test
    public void 상품_주문() throws Exception{
        //given
        Member member = createMember();
        Book book = createBook("시골 JPA", 10000, 10);
        int orderCount = 2;

        // when
        Long orderId = orderService.order(member.getId(), book.getId(), orderCount);

        // then
        Order getOrder = orderRepository.findOne(orderId);

        assertEquals(OrderStatus.ORDER, getOrder.getStatus());
        // 상품 주문 시 상태는 ORDER인지 체크한다.

        assertEquals(1, getOrder.getOrderItems().size());
        // 주문한 상품 종류 수가 정확해야 한다. (1개 주문 했으므로...)

        assertEquals(10000*orderCount, getOrder.getTotalPrice());
        // 주문 가격은 가격 * 수량이다.

        assertEquals(8, book.getStockQuantity());
        // 주문 수량만큼 재고가 줄어야 한다.
    }

    private Book createBook(String name, int price, int quantity) {
        Book book = new Book();
        book.setName(name);
        book.setPrice(price);
        book.setStockQuantity(quantity);
        em.persist(book);
        return book;
    }

    private Member createMember() {
        Member member = new Member();
        member.setName("멤버1");
        member.setAddress(new Address("서울", "강가", "123-123"));
        em.persist(member);
        return member;
    }

    @Test
     public void 주문_취소() throws Exception{
        //given
        Member member = createMember();
        Book item = createBook("시골 JPA", 10000, 10);

        int orderCount = 2;
        Long orderId = orderService.order(member.getId(), item.getId(), orderCount);

        // when
        orderService.cancelOrder(orderId);

        // then
        Order getOrder = orderRepository.findOne(orderId);
        assertEquals(OrderStatus.CANCEL, getOrder.getStatus());
        // 주문 취소 시 상태는 CANCEL이다.
        assertEquals(10, item.getStockQuantity());
        // 주문이 취소된 상품은 그만큼 재고가 증가해야 한다.
    }
      
      @Test
      // 재고 수량이 초과가 되면 위 exception이 터져야 함.
      public void 상품주문_재고수량초과() throws Exception{
          //given
          Member member = createMember();
          Item item = createBook("시골 JPA", 10000, 10);

          int orderCount = 11; // 현재 재고가 10개인데 11개 주문 시 예외 터져야 함.

          // when
          // orderService.order를 할 때 예외가 터져야 함.
          assertThrows(NotEnoughStockException.class, () -> {
              orderService.order(member.getId(), item.getId(), orderCount);
          });

          // then
          // *오류남. fail("재고 수량 부족 예외가 발생해야 한다.");
       }

}