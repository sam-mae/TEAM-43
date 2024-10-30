package beinus.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import beinus.backend.domain.Delivery;
import beinus.backend.domain.Member;
import beinus.backend.domain.Order;
import beinus.backend.domain.OrderItem;
import beinus.backend.domain.item.Item;
import beinus.backend.repository.ItemRepository;
import beinus.backend.repository.MemberRepository;
import beinus.backend.repository.OrderRepository;
import beinus.backend.repository.OrderSearch;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;
    private final ItemRepository itemRepository;

    /**
     * 주문
     */
    @Transactional // 주문은 data를 변경해야 하기에 @Transactional 필요
    public Long order(Long memberId, Long itemId, int count){
        //엔티티 조회
        Member member = memberRepository.findOne(memberId);
        Item item = itemRepository.findOne(itemId);

        //배송정보 생성
        Delivery delivery = new Delivery();
        delivery.setAddress(member.getAddress());

        // 주문 상품 생성
        OrderItem orderItem = OrderItem.createOrderItem(item, item.getPrice(), count);

        // 주문 생성
        Order order = Order.createOrder(member, delivery, orderItem);

        // 주문 저장
        orderRepository.save(order);
        /*
        주문 저장 시 Cascade 옵션이 있기 때문에 OrderItem과 Delivery는 함께
        persist되면서 DB table에 INSERT 쿼리가 날라간다.
         */

        return order.getId();
    }

    /**
     * 주문 취소
     */
    @Transactional
    public void cancelOrder(Long orderId){
        // 주문 엔티티 조회
        Order order = orderRepository.findOne(orderId);

        // 주문 취소
        order.cancel();
    }

    // 검색
    public List<Order> findOrders(OrderSearch orderSearch){
        return orderRepository.findAll(orderSearch);
    }
}
