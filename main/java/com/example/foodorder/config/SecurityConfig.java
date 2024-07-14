package com.example.foodorder.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable() // 仅供示范，生产环境请启用 CSRF 保护
                .authorizeRequests()
                .requestMatchers("/users/register", "/users/login", "/orders/place", "/users").permitAll() // 允许匿名访问这些端点
                .anyRequest().authenticated()
                .and()
                .httpBasic(); // 启用基本 HTTP 身份验证

        return http.build();
    }
}

