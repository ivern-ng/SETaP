package com.example.foodorder.service;

import com.example.foodorder.model.User;
import com.example.foodorder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void register(User user) {
        userRepository.save(user);
    }

    @Transactional
    public void deleteUsers(List<Long> userIds) {
        userRepository.deleteAllById(userIds);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean authenticateUser(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user != null && user.getPassword() != null && user.getPassword().equals(password)) {
            return true;
        }
        return false;
    }
}
