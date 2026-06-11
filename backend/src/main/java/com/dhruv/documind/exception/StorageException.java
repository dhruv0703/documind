package com.dhruv.documind.exception;

import org.springframework.http.HttpStatus;

public class StorageException extends AppException {

    public StorageException(String message) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, message);
    }
}
