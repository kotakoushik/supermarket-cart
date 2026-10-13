package com.supermarket.cart.repository;

import com.supermarket.cart.entity.Customer;
import com.supermarket.cart.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByCustomerOrderByCreatedAtDesc(Customer customer);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Order> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);

    Optional<Order> findByIdAndCustomer(Long id, Customer customer);
}
