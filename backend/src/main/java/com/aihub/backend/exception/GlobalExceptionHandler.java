package com.aihub.backend.exception;

import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException ex) {
        Map<String, String> error = new HashMap<>();
        String localizedMessage = messageSource.getMessage("auth.invalid.credentials", null, LocaleContextHolder.getLocale());
        error.put("message", localizedMessage);
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        
        // Try to translate the message if it's a key
        String localizedMessage;
        try {
            localizedMessage = messageSource.getMessage(ex.getMessage(), null, LocaleContextHolder.getLocale());
        } catch (Exception e) {
            localizedMessage = ex.getMessage();
        }

        error.put("message", localizedMessage);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}
