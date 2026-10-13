package com.supermarket.cart.repository;

import com.supermarket.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCartId(String cartId);

    Optional<CartItem> findByCartIdAndProductId(String cartId, Long productId);

    void deleteByCartIdAndProductId(String cartId, Long productId);

    void deleteByCartId(String cartId);
}
