package com.dhruv.documind.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Validated
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Cors cors = new Cors();
    private final Ai ai = new Ai();
    private final Jwt jwt = new Jwt();
    private final Storage storage = new Storage();
    private final Aws aws = new Aws();
    private final Rag rag = new Rag();

    @Data
    public static class Cors {
        private List<String> allowedOrigins = new ArrayList<>(List.of("http://localhost:5173"));
    }

    @Data
    public static class Ai {
        private final Chat chat = new Chat();
        private final Embeddings embeddings = new Embeddings();
    }

    @Data
    public static class Chat {
        private boolean enabled = true;
    }

    @Data
    public static class Embeddings {
        private boolean enabled = true;
    }

    @Data
    public static class Jwt {
        @NotBlank
        private String secret;

        @Min(60000)
        private long expirationMs = 86_400_000L;
    }

    @Data
    public static class Storage {
        @NotBlank
        private String provider = "local";

        @NotBlank
        private String localUploadDir = "uploads";
    }

    @Data
    public static class Aws {
        @NotBlank
        private String region = "ap-south-1";

        private final S3 s3 = new S3();
    }

    @Data
    public static class S3 {
        private String bucket = "";
    }

    @Data
    public static class Rag {
        @Min(100)
        private int chunkSize = 1200;

        @Min(0)
        private int chunkOverlap = 200;

        @Min(1)
        private int embeddingDimension = 1536;
    }
}
