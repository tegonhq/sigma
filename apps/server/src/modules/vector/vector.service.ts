// apps/server/src/modules/vector-store/vector-store.service.ts
import { openai } from '@ai-sdk/openai';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { embed } from 'ai';

@Injectable()
export class VectorStoreService implements OnModuleInit {
  private qdrantClient: QdrantClient;

  constructor(private configService: ConfigService) {
    // Initialize Qdrant client
    this.qdrantClient = new QdrantClient({
      url: this.configService.get<string>('QDRANT_URL'),
      apiKey: this.configService.get<string>('QDRANT_API_KEY'),
    });
  }

  async onModuleInit() {
    // Ensure collections exist
    await this.ensureCollections();
  }

  private async ensureCollections() {
    // Create tasks collection if it doesn't exist
    try {
      await this.qdrantClient.getCollection('tasks');
    } catch (e) {
      await this.qdrantClient.createCollection('tasks', {
        vectors: {
          size: 1536, // For OpenAI embeddings
          distance: 'Cosine',
        },
        optimizers_config: {
          default_segment_number: 2,
        },
      });

      // Create indexes for filtering
      await this.qdrantClient.createPayloadIndex('tasks', {
        field_name: 'status',
        field_schema: 'keyword',
      });

      await this.qdrantClient.createPayloadIndex('tasks', {
        field_name: 'workspaceId',
        field_schema: 'keyword',
      });

      await this.qdrantClient.createPayloadIndex('tasks', {
        field_name: 'listId',
        field_schema: 'keyword',
      });

      await this.qdrantClient.createPayloadIndex('tasks', {
        field_name: 'dueDate',
        field_schema: 'float',
      });
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: text,
    });

    return embedding;
  }

  getQdrantClient(): QdrantClient {
    return this.qdrantClient;
  }
}
