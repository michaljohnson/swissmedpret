package com.swissmedpreter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * SwissMedPreter — On-premises medical translation system.
 *
 * Architectural placement: Application Server tier (see SA Report §4.2).
 * This service runs entirely inside the hospital network perimeter and
 * communicates with:
 *   - Client devices via REST + WebSocket (Client API)
 *   - Local AI containers via REST/gRPC  (Backend Services)
 *   - The KIS via HL7 FHIR R4            (Backend Services)
 *
 * No data leaves the hospital network. All traffic is TLS 1.3.
 */
@SpringBootApplication
public class SwissMedPreterApplication {
    public static void main(String[] args) {
        SpringApplication.run(SwissMedPreterApplication.class, args);
    }
}
