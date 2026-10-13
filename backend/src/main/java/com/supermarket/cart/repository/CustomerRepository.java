package com.supermarket.cart.repository;

import com.supermarket.cart.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
