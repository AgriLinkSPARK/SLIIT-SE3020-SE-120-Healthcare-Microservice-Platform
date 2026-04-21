package com.sliit.healthcare.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sliit.healthcare.auth.model.User;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUserId(String userId);

    List<User> findByUserIdIn(List<String> userIds);

    boolean existsByEmail(String email);
}
