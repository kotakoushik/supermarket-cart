package com.supermarket.cart.repository;

import com.supermarket.cart.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrue();

    List<Product> findByActiveTrue(Sort sort);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT p FROM Product p WHERE p.active = true " +
           "AND (:category IS NULL OR LOWER(p.category) = LOWER(:category)) " +
           "AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Product> searchProducts(@Param("category") String category, @Param("search") String search, Sort sort);

    // Alternatives: cheaper active products in the same category
    @Query("SELECT p FROM Product p WHERE p.active = true " +
           "AND p.category = :category " +
           "AND p.id <> :productId " +
           "AND p.price < :price " +
           "ORDER BY p.price ASC")
    List<Product> findCheaperAlternatives(@Param("category") String category, 
                                          @Param("productId") Long productId, 
                                          @Param("price") BigDecimal price);

    // Complementary recommendations by categories
    @Query("SELECT p FROM Product p WHERE p.active = true " +
           "AND p.category IN :categories " +
           "AND p.id NOT IN :excludedIds " +
           "ORDER BY p.stockQuantity DESC")
    List<Product> findRecommendations(@Param("categories") List<String> categories, 
                                      @Param("excludedIds") List<Long> excludedIds);
}
