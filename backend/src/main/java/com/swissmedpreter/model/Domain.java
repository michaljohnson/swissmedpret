package com.swissmedpreter.model;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Domain models exchanged between the React client, the application
 * server, the on-prem AI containers and the KIS.
 *
 * All identifiers are UUIDs to allow distributed generation; no
 * personally identifying data is carried in transcript objects, only
 * the case number issued by the KIS.
 */
public class Domain {

    /** A single utterance in a conversation. */
    public record Message(
        UUID id,
        String caseNumber,
        Speaker speaker,
        String original,
        String sourceLang,
        String translation,
        String targetLang,
        Instant time,
        Status status,
        List<String> detectedTerms
    ) {}

    public enum Speaker { STAFF, PATIENT }
    public enum Status { TRANSLATING, DONE, FAILED }

    /** Inbound: the client asks the server to translate one utterance. */
    public record TranslationRequest(
        String caseNumber,
        Speaker speaker,
        String text,
        String sourceLang,
        String targetLang
    ) {}

    /** Outbound: the server's response after the local LLM returns. */
    public record TranslationResponse(
        UUID messageId,
        String translation,
        List<String> detectedTerms,
        long latencyMs,
        String engine
    ) {}

    /** A medical-lexicon entry. */
    public record LexiconEntry(
        String id,
        String category,
        List<String> keywords,
        java.util.Map<String, String> translations,
        String pictogram
    ) {}
}
