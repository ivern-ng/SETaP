package com.example.foodorder.repository;

import com.example.foodorder.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username); // 返回单个 User 对象
}


