package com.dhruv.documind.util;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

@Component
public class PgVectorSqlUtil {

    public String toSqlVector(List<Double> values) {
        return values.stream()
                .map(value -> String.format(Locale.US, "%.12f", value))
                .collect(Collectors.joining(",", "[", "]"));
    }
}
