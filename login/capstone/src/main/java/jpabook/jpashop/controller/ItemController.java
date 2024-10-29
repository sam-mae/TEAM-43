package jpabook.jpashop.controller;

import jpabook.jpashop.domain.item.Book;
import jpabook.jpashop.domain.item.Item;
import jpabook.jpashop.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @GetMapping("/items/new")
    public String createForm(Model model){
        model.addAttribute("form", new BookForm());
        return "items/createItemForm";
    }

    @PostMapping("/items/new")
    public String create(BookForm form){
        Book book = createBook(form);

        itemService.saveItem(book);
        return "redirect:/items";
    }

    @GetMapping("/items")
    public String list(Model model){
        List<Item> items = itemService.findItems();
        model.addAttribute("items", items);
        return "items/itemList";
    }

    @GetMapping("/items/{itemId}/edit")
    public String updateForm(@PathVariable("itemId") Long itemId, Model model){

        Book item = (Book)itemService.findOne(itemId); // 예제에서는 book만 가져옴.

        BookForm form = new BookForm();
        form.setId(item.getId());
        form.setIsbn(item.getIsbn());
        form.setAuthor(item.getAuthor());
        form.setPrice(item.getPrice());
        form.setName(item.getName());
        form.setStockQuantity(item.getStockQuantity());

        model.addAttribute("form", form);
        return "items/updateItemForm";
    }

    @PostMapping("/items/{itemId}/edit")
    public String updateItem(@PathVariable Long itemId, @ModelAttribute("form") BookForm form){
        Book book = new Book();

        /*
        여기서는 book이 새로운 Book 객체로 만들어졌다. 다만, getId()로 JPA가 식별 가능한
        id를 가져와서 수정을 하고 있지만 JPA의 손에서 벗어난 준영속 상태의 Entity이다.

        즉, JPA에 의해 관리되지 못하므로 아무리 값을 바꿔치기해도 DB에 flush 되지 못한다.
        준영속 엔티티를 수정하는 방법은 무엇일까?
        1. 변경 감지(Dirty Checking) 기능 사용
        2. 병합(merge; 준영속 상태의 엔티티를 영속 상태로 변경 시 사용) 사용
           -> 2는 예기치 않은 변경을 초래할 수 있음. 엔티티 변경 시 1을 사용할 것.
         */
//        book.setId(form.getId());
//        book.setName(form.getName());
//        book.setPrice(form.getPrice());
//        book.setStockQuantity(form.getStockQuantity());
//        book.setAuthor(form.getAuthor());
//        book.setIsbn(form.getIsbn());
        itemService.updateItem(itemId, form.getName(), form.getPrice(), form.getStockQuantity());
        // 어설프게 Entity를 parameter로 사용하지 않고, 필요한 데이터만 추출한다.

        itemService.saveItem(book);
        return "redirect:/items";
    }

    private static Book createBook(BookForm form) {
        Book book = new Book();
        book.setName(form.getName());
        book.setPrice(form.getPrice());
        book.setAuthor(form.getAuthor());
        book.setStockQuantity(form.getStockQuantity());
        book.setIsbn(form.getIsbn());
        return book;
    }
}
