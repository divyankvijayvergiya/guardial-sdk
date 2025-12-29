package com.guardial.sdk;

/**
 * Exception thrown by Guardial SDK
 */
public class GuardialException extends Exception {
    public GuardialException(String message) {
        super(message);
    }

    public GuardialException(String message, Throwable cause) {
        super(message, cause);
    }
}



