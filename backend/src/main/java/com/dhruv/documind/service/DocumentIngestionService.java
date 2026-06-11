package com.dhruv.documind.service;

import org.springframework.web.multipart.MultipartFile;

import com.dhruv.documind.entity.Document;

public interface DocumentIngestionService {

    Document ingest(Document document, MultipartFile file);
}
