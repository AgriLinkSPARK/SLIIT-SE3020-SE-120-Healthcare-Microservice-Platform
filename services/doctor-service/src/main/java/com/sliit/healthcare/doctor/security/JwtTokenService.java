package com.sliit.healthcare.doctor.security;

import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

@Service
public class JwtTokenService {

    private final JwtProperties jwtProperties;

    public JwtTokenService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public DecodedJWT verify(String token) {
        return JWT.require(Algorithm.HMAC256(jwtProperties.secret()))
                .withIssuer(jwtProperties.issuer())
                .build()
                .verify(token);
    }
}
