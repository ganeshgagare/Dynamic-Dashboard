package com.dashboard.dto;

import java.time.Instant;

public class ApiErrorResponse {

    private final Instant timestamp = Instant.now();
    private final int status;
    private final String message;

    public ApiErrorResponse(int status, String message) {
        this.status  = status;
        this.message = message;
    }

    public Instant getTimestamp() { return timestamp; }
    public int     getStatus()   { return status; }
    public String  getMessage()  { return message; }
}
