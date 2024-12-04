import axios from 'axios';

import { VoyageEmbeddingResponse } from './types';

export async function getEmbeddingBatch(
  texts: string[],
  model: string = 'voyage-code-2',
) {
  try {
    console.log(process.env.VOYAGE_API_KEY);
    const response = await axios.post(
      'https://api.voyageai.com/v1/embeddings',
      {
        model,
        input: texts,
      },
      {
        headers: {
          Authorization: `Bearer pa-Is2choMKvugkcTV_oBYBrWBaZ_g8INVB8s8NjL8oXGI`,
          'Content-Type': 'application/json',
        },
      },
    );

    const result = response.data as VoyageEmbeddingResponse;
    return result.data.map((item) => item.embedding);
  } catch (error) {
    console.error('Error getting Voyage embedding:', error);
    throw error;
  }
}
