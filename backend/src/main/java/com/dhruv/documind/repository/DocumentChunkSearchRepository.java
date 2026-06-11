package com.dhruv.documind.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.dhruv.documind.dto.chat.DocumentChunkSearchResult;

@Repository
public class DocumentChunkSearchRepository {

    private static final String SEARCH_SIMILAR_CHUNKS_SQL = """
            SELECT id, document_id, chunk_index, content, 1 - (embedding <=> ?::vector) AS similarity
            FROM document_chunks
            WHERE document_id = ?
              AND embedding IS NOT NULL
            ORDER BY embedding <=> ?::vector
            LIMIT ?
            """;

    private final JdbcTemplate jdbcTemplate;

    public DocumentChunkSearchRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<DocumentChunkSearchResult> searchSimilarChunks(UUID documentId, String queryEmbeddingVector, int limit) {
        return jdbcTemplate.query(
                SEARCH_SIMILAR_CHUNKS_SQL,
                (resultSet, rowNum) -> mapRow(resultSet),
                queryEmbeddingVector,
                documentId,
                queryEmbeddingVector,
                limit
        );
    }

    private DocumentChunkSearchResult mapRow(ResultSet resultSet) throws SQLException {
        return new DocumentChunkSearchResult(
                resultSet.getObject("id", UUID.class),
                resultSet.getObject("document_id", UUID.class),
                resultSet.getInt("chunk_index"),
                resultSet.getString("content"),
                resultSet.getDouble("similarity")
        );
    }
}
