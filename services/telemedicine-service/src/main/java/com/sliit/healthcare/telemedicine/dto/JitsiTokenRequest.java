package com.sliit.healthcare.telemedicine.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JitsiTokenRequest {
    private String room;
    private String sub;
    private String name;
    private String email;
    private String avatar;
    private long aud;
    private long iat;
    private long exp;
}
