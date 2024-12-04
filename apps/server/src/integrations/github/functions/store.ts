import { QdrantClient } from '@qdrant/js-client-rest';

import { getEmbeddingBatch } from './embed';
import { Document } from './types';

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

export async function storeDocuments(
  documents: Document[],
  collectionName: string,
) {
  const qdrant = new QdrantClient({ host: 'localhost', port: 6333 });

  await ensureQdrantCollection(qdrant, collectionName);
  // Process documents in batches to avoid memory issues
  const batchSize = 50;
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    console.log(batch.length);

    // Get embeddings for the batch
    const texts = batch.map((doc) => doc.text);
    const embeddings = await getEmbeddingBatch(texts);

    // Prepare points for Qdrant
    const points = batch.map((doc, index) => {
      const point = {
        id: Math.abs(hashCode(doc.path + doc.start)),
        vector: embeddings[index],
        payload: {
          content: doc.text,
          path: doc.path,
          start: doc.start,
          end: doc.end,
        },
      };
      console.log('Created point:', {
        id: point.id,
        vectorSize: point.vector.length,
        contentPreview: doc.text.substring(0, 100),
      });
      return point;
    });

    // Upsert points to Qdrant
    const result = await qdrant.upsert(collectionName, {
      wait: true,
      points,
    });

    console.log('Upsert result:', result);
  }
}

export async function ensureQdrantCollection(
  qdrant: QdrantClient,
  collectionName: string,
) {
  try {
    // Check if collection exists
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === collectionName,
    );

    if (!exists) {
      // Create collection with the correct vector size for Voyage AI embeddings
      await qdrant.createCollection(collectionName, {
        vectors: {
          size: 1536, // Voyage AI embedding size
          distance: 'Cosine',
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });

      // Create payload indexes to match the existing payload structure
      await qdrant.createPayloadIndex(collectionName, {
        field_name: 'content',
        field_schema: 'text',
      });

      await qdrant.createPayloadIndex(collectionName, {
        field_name: 'path',
        field_schema: 'keyword',
      });

      await qdrant.createPayloadIndex(collectionName, {
        field_name: 'start',
        field_schema: 'integer',
      });

      await qdrant.createPayloadIndex(collectionName, {
        field_name: 'end',
        field_schema: 'integer',
      });
    }
  } catch (error) {
    console.error('Error ensuring Qdrant collection exists:', error);
    throw error;
  }
}

/**
 * Delete points from a collection that match a given file path
 */
export async function deletePointsByPath(collectionName: string, path: string) {
  const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });

  try {
    await qdrant.delete(collectionName, {
      filter: {
        must: [
          {
            key: 'path',
            match: {
              value: path,
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error deleting points by path:', error);
    throw error;
  }
}
