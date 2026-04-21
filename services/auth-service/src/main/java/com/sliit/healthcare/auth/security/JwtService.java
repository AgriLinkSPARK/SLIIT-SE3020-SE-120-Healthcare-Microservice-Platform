package com.sliit.healthcare.auth.security;

import java.time.Instant;
import java.util.Date;

import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.sliit.healthcare.auth.model.User;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(jwtProperties.expirationMinutes() * 60);

        return JWT.create()
                .withIssuer(jwtProperties.issuer())
                .withSubject(user.getUserId())
                .withClaim("email", user.getEmail())
                .withClaim("role", user.getRole().name())
                .withIssuedAt(Date.from(now))
                .withExpiresAt(Date.from(expiresAt))
                .sign(Algorithm.HMAC256(jwtProperties.secret()));
    }

    public DecodedJWT verifyToken(String token) {
        return JWT.require(Algorithm.HMAC256(jwtProperties.secret()))
                .withIssuer(jwtProperties.issuer())
                .build()
                .verify(token);
    }

    public String extractUserId(String token) {
        return verifyToken(token).getSubject();
    }
}
