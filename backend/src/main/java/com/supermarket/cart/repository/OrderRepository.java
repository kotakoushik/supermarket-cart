package com.supermarket.cart.repository;

import com.supermarket.cart.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);
}
