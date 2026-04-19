package com.swissmedpreter.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.swissmedpreter.model.LexiconEntry;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;

@Service
public class LexiconService {
    private final List<LexiconEntry> lexicon;

    public LexiconService(ObjectMapper objectMapper) throws IOException {
        try (InputStream inputStream = new ClassPathResource("lexicon.json").getInputStream()) {
            this.lexicon = objectMapper.readValue(inputStream, new TypeReference<>() {});
        }
    }

    public List<LexiconEntry> getLexicon() {
        return Collections.unmodifiableList(lexicon);
    }
}
