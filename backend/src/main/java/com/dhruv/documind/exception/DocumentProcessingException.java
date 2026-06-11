package com.dhruv.documind.exception;

import org.springframework.http.HttpStatus;

public class DocumentProcessingException extends AppException {

    public DocumentProcessingException(String message) {
        super(HttpStatus.UNPROCESSABLE_ENTITY, message);
    }
}
