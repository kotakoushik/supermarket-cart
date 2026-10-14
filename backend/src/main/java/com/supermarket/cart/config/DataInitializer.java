package com.supermarket.cart.config;

import com.supermarket.cart.entity.Customer;
import com.supermarket.cart.entity.Product;
import com.supermarket.cart.repository.CustomerRepository;
import com.supermarket.cart.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DataInitializer(ProductRepository productRepository, CustomerRepository customerRepository) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            List<Product> products = List.of(
                // 1. Dairy
                new Product("Amul Taaza Toned Milk 1L", "Homogenized toned fresh milk, high calcium and protein.", "Dairy", new BigDecimal("56.00"), 40, "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80"),
                new Product("Mother Dairy Cow Milk 1L", "Pure wholesome cow milk with essential nutrients.", "Dairy", new BigDecimal("54.00"), 35, "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80"),
                new Product("Amul Pasteurized Butter 500g", "Delicious creamy salted butter made from pure milk fat.", "Dairy", new BigDecimal("275.00"), 30, "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80"),
                new Product("Nandini Salted Butter 500g", "Wholesome fresh dairy table butter with rich taste.", "Dairy", new BigDecimal("250.00"), 25, "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80"),

                // 2. Bakery
                new Product("Harvest Gold Multigrain Bread 400g", "Wholesome fiber-rich multigrain sliced brown bread.", "Bakery", new BigDecimal("55.00"), 25, "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80"),
                new Product("Modern Classic White Bread 400g", "Soft and fresh daily breakfast sandwich bread.", "Bakery", new BigDecimal("35.00"), 45, "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=400&q=80"),

                // 3. Breakfast
                new Product("Kellogg's Corn Flakes 500g", "Crunchy toasted golden flakes enriched with 8 essential vitamins.", "Breakfast", new BigDecimal("210.00"), 30, "https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&w=400&q=80"),
                new Product("Quaker Whole Rolled Oats 1kg", "100% natural wholegrain oats supporting heart health.", "Breakfast", new BigDecimal("190.00"), 35, "https://images.unsplash.com/photo-1614961908595-5db4f3640e10?auto=format&fit=crop&w=400&q=80"),

                // 4. Grains and Pulses
                new Product("India Gate Basmati Rice Feast 5kg", "Aromatic long-grain aged authentic Basmati rice.", "Grains and Pulses", new BigDecimal("580.00"), 20, "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80"),
                new Product("Fortune Everyday Basmati Rice 5kg", "Fine long grain fragrant basmati suitable for daily meals.", "Grains and Pulses", new BigDecimal("420.00"), 25, "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=400&q=80"),
                new Product("Tata Sampann Unpolished Toor Dal 1kg", "Protein-rich unpolished nutritious pigeon peas.", "Grains and Pulses", new BigDecimal("175.00"), 40, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"),
                new Product("Nature Fresh Pure Toor Dal 1kg", "Clean, wholesome, and pesticide-free toor dal.", "Grains and Pulses", new BigDecimal("155.00"), 35, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"),

                // 5. Fruits and Vegetables
                new Product("Fresh Royal Delicious Apples 1kg", "Sweet, crisp and farm-picked high altitude apples.", "Fruits and Vegetables", new BigDecimal("180.00"), 25, "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80"),
                new Product("Fresh Nagpur Oranges 1kg", "Juicy, sweet and tangy vitamin C rich citrus oranges.", "Fruits and Vegetables", new BigDecimal("90.00"), 30, "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80"),
                new Product("Fresh Farm Potatoes 2kg", "Washed, firm and starchy golden farm potatoes.", "Fruits and Vegetables", new BigDecimal("60.00"), 50, "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80"),
                new Product("Fresh Red Onions 2kg", "Pungent and crisp red onions sourced from Nashik.", "Fruits and Vegetables", new BigDecimal("80.00"), 45, "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80"),

                // 6. Snacks
                new Product("Lay's India's Magic Masala 50g", "Crispy potato chips seasoned with aromatic Indian spices.", "Snacks", new BigDecimal("20.00"), 60, "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80"),
                new Product("Haldiram's Nagpur Bhujia Sev 400g", "Crunchy authentic besan sev prepared with traditional spices.", "Snacks", new BigDecimal("110.00"), 35, "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80"),

                // 7. Beverages
                new Product("Tata Tea Gold Premium 500g", "Exquisite blend of CTC tea with gently rolled long leaves.", "Beverages", new BigDecimal("320.00"), 30, "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=400&q=80"),
                new Product("Brooke Bond Red Label Tea 500g", "Special blend packed with taste and natural flavonoids.", "Beverages", new BigDecimal("290.00"), 35, "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80"),
                new Product("Nescafe Classic Instant Coffee 100g", "Rich aroma and distinctive roasted coffee flavor.", "Beverages", new BigDecimal("340.00"), 20, "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80"),

                // 8. Cooking Essentials
                new Product("Fortune Sunlite Refined Sunflower Oil 1L", "Light, healthy and heart-friendly refined cooking oil.", "Cooking Essentials", new BigDecimal("145.00"), 40, "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80"),
                new Product("Gemini Pure Refined Sunflower Oil 1L", "Fortified sunflower oil with vitamins A & D for daily cooking.", "Cooking Essentials", new BigDecimal("130.00"), 35, "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80"),
                new Product("Tata Salt Vacuum Evaporated 1kg", "Desh Ka Namak, pure vacuum evaporated iodized salt.", "Cooking Essentials", new BigDecimal("28.00"), 60, "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=400&q=80"),
                new Product("Catch Free Flow Iodized Salt 1kg", "Fine crystal iodized salt with non-caking minerals.", "Cooking Essentials", new BigDecimal("22.00"), 50, "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=400&q=80"),

                // 9. Household Products
                new Product("Surf Excel Easy Wash Detergent Powder 1kg", "Superior stain removal power with active oxygen crystals.", "Household Products", new BigDecimal("140.00"), 30, "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=400&q=80"),
                new Product("Vim Dishwash Liquid Gel Lemon 750ml", "Powerful degreasing lemon formula for shining utensils.", "Household Products", new BigDecimal("155.00"), 35, "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=400&q=80")
            );

            productRepository.saveAll(products);
        }

        if (!customerRepository.existsByEmailIgnoreCase("customer@freshcart.com")) {
            Customer demoCustomer = new Customer(
                    "Demo Shopper",
                    "customer@freshcart.com",
                    passwordEncoder.encode("Password123!"),
                    "+91 9876543210",
                    "123 Indiranagar, Bengaluru"
            );
            customerRepository.save(demoCustomer);
        }
    }
}
