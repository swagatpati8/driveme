package com.driveme.driveme.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockagentruntime.BedrockAgentRuntimeAsyncClient;
import software.amazon.awssdk.services.bedrockagentruntime.model.InvokeAgentRequest;
import software.amazon.awssdk.services.bedrockagentruntime.model.InvokeAgentResponseHandler;

import java.util.UUID;

@Service
public class BedrockService {

    @Value("${bedrock.agent.id}")
    private String agentId;

    @Value("${bedrock.agent.alias}")
    private String agentAliasId;

    private final BedrockAgentRuntimeAsyncClient client;

    public BedrockService() {
        this.client = BedrockAgentRuntimeAsyncClient.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    public String chat(String userMessage) {
        String sessionId = UUID.randomUUID().toString();

        InvokeAgentRequest request = InvokeAgentRequest.builder()
                .agentId(agentId)
                .agentAliasId(agentAliasId)
                .sessionId(sessionId)
                .inputText(userMessage)
                .build();

        StringBuilder response = new StringBuilder();

        InvokeAgentResponseHandler.Visitor visitor = InvokeAgentResponseHandler.Visitor.builder()
                .onChunk(chunk -> response.append(chunk.bytes().asUtf8String()))
                .build();

        InvokeAgentResponseHandler handler = InvokeAgentResponseHandler.builder()
                .subscriber(visitor)
                .build();

        try {
            client.invokeAgent(request, handler).join();
            System.out.println("Bedrock response: " + response.toString());
        } catch (Exception e) {
            System.out.println("Bedrock error: " + e.getMessage());
            return "Error: " + e.getMessage();
        }

        return response.isEmpty() ? "Agent returned empty response" : response.toString();
    }
}
