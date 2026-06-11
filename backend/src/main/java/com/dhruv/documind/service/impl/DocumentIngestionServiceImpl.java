package com.dhruv.documind.service.impl;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.dhruv.documind.config.AppProperties;
import com.dhruv.documind.entity.Document;
import com.dhruv.documind.entity.DocumentChunk;
import com.dhruv.documind.entity.DocumentStatus;
import com.dhruv.documind.exception.DocumentProcessingException;
import com.dhruv.documind.repository.DocumentChunkRepository;
import com.dhruv.documind.repository.DocumentRepository;
import com.dhruv.documind.service.DocumentIngestionService;
import com.dhruv.documind.service.EmbeddingService;
import com.dhruv.documind.service.PdfTextExtractorService;
import com.dhruv.documind.service.TextChunkingService;
import com.dhruv.documind.util.PgVectorSqlUtil;
import com.dhruv.documind.util.TokenEstimatorUtil;

@Service
public class DocumentIngestionServiceImpl implements DocumentIngestionService {

    private static final Logger log = LoggerFactory.getLogger(DocumentIngestionServiceImpl.class);

    private static final String UPDATE_EMBEDDING_SQL = """
            UPDATE document_chunks
            SET embedding = CAST(? AS vector)
            WHERE id = ?
            """;

    private final AppProperties appProperties;
    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository documentChunkRepository;
    private final PdfTextExtractorService pdfTextExtractorService;
    private final TextChunkingService textChunkingService;
    private final EmbeddingService embeddingService;
    private final PgVectorSqlUtil pgVectorSqlUtil;
    private final JdbcTemplate jdbcTemplate;
    private final TokenEstimatorUtil tokenEstimatorUtil;

    public DocumentIngestionServiceImpl(
            AppProperties appProperties,
            DocumentRepository documentRepository,
            DocumentChunkRepository documentChunkRepository,
            PdfTextExtractorService pdfTextExtractorService,
            TextChunkingService textChunkingService,
            EmbeddingService embeddingService,
            PgVectorSqlUtil pgVectorSqlUtil,
            JdbcTemplate jdbcTemplate,
            TokenEstimatorUtil tokenEstimatorUtil
    ) {
        this.appProperties = appProperties;
        this.documentRepository = documentRepository;
        this.documentChunkRepository = documentChunkRepository;
        this.pdfTextExtractorService = pdfTextExtractorService;
        this.textChunkingService = textChunkingService;
        this.embeddingService = embeddingService;
        this.pgVectorSqlUtil = pgVectorSqlUtil;
        this.jdbcTemplate = jdbcTemplate;
        this.tokenEstimatorUtil = tokenEstimatorUtil;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED, noRollbackFor = DocumentProcessingException.class)
    public Document ingest(Document document, MultipartFile file) {
        long startedAt = System.currentTimeMillis();
        document.setStatus(DocumentStatus.PROCESSING);
        documentRepository.save(document);
        log.info("Document processing started. documentId={}", document.getId());

        try {
            String extractedText = pdfTextExtractorService.extractText(file);
            List<String> chunks = textChunkingService.chunkText(extractedText);
            if (chunks.isEmpty()) {
                throw new DocumentProcessingException("No text chunks could be created from the extracted PDF content");
            }
            log.info("Document text extracted and chunked. documentId={}, chunkCount={}", document.getId(), chunks.size());

            List<DocumentChunk> persistedChunks = new java.util.ArrayList<>(chunks.size());
            for (int i = 0; i < chunks.size(); i++) {
                String chunkContent = chunks.get(i);
                DocumentChunk chunk = DocumentChunk.builder()
                        .id(UUID.randomUUID())
                        .document(document)
                        .chunkIndex(i)
                        .content(chunkContent)
                        .tokenEstimate(tokenEstimatorUtil.estimate(chunkContent))
                        .embedding(null)
                        .build();
                documentChunkRepository.save(chunk);
                document.getChunks().add(chunk);
                persistedChunks.add(chunk);
            }

            if (appProperties.getAi().getEmbeddings().isEnabled()) {
                List<List<Double>> embeddings = embeddingService.embedAll(chunks);
                if (embeddings.size() != persistedChunks.size()) {
                    throw new DocumentProcessingException("Embedding count does not match chunk count");
                }

                for (int i = 0; i < persistedChunks.size(); i++) {
                    jdbcTemplate.update(
                            UPDATE_EMBEDDING_SQL,
                            pgVectorSqlUtil.toSqlVector(embeddings.get(i)),
                            persistedChunks.get(i).getId()
                    );
                }
                log.info("Embedding generation completed. documentId={}, chunkCount={}", document.getId(), embeddings.size());
            } else {
                log.warn("Embeddings skipped because feature flag is disabled. documentId={}, chunkCount={}", document.getId(), persistedChunks.size());
            }

            document.setStatus(DocumentStatus.READY);
            Document saved = documentRepository.save(document);
            log.info(
                    "Document processing completed. documentId={}, chunkCount={}, status={}, processingTimeMs={}",
                    document.getId(),
                    saved.getChunks().size(),
                    saved.getStatus(),
                    System.currentTimeMillis() - startedAt
            );
            return saved;
        } catch (DocumentProcessingException ex) {
            document.setStatus(DocumentStatus.FAILED);
            documentRepository.save(document);
            log.error(
                    "Document processing failed. documentId={}, status={}, processingTimeMs={}, reason={}",
                    document.getId(),
                    document.getStatus(),
                    System.currentTimeMillis() - startedAt,
                    ex.getMessage()
            );
            throw ex;
        } catch (RuntimeException ex) {
            document.setStatus(DocumentStatus.FAILED);
            documentRepository.save(document);
            log.error(
                    "Document processing failed unexpectedly. documentId={}, status={}, processingTimeMs={}",
                    document.getId(),
                    document.getStatus(),
                    System.currentTimeMillis() - startedAt,
                    ex
            );
            throw new DocumentProcessingException("Document processing failed unexpectedly");
        }
    }
}
