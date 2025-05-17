// apps/server/src/modules/vector-store/task-vector.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UnifiedSearchOptionsDto } from '@tegonhq/sigma-sdk';
import { CohereClientV2 } from 'cohere-ai';
import { PrismaService } from 'nestjs-prisma';

import { VectorStoreService } from 'modules/vector/vector.service';

import { TasksService } from './tasks.service';
import { parseSearchQuery } from './tasks.utils';

// ... other code from previous example ...

@Injectable()
export class TaskVectorService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private vectorStore: VectorStoreService,
    private configService: ConfigService,
    private tasksService: TasksService,
  ) {}
  /**
   * Initialize task vector collection and indexes
   */
  async onModuleInit() {
    await this.ensureTaskCollection();
    // await this.reindexWorkspaceTasks('87cc1c1d-ba89-4040-a91a-c2c19917d294');
  }

  /**
   * Ensure the tasks collection exists with proper indexes
   */
  private async ensureTaskCollection() {
    try {
      // await this.vectorStore.getQdrantClient().deleteCollection('task');
      await this.vectorStore.getQdrantClient().getCollection('tasks');
    } catch (e) {
      // Collection doesn't exist, create it
      await this.vectorStore.getQdrantClient().createCollection('tasks', {
        vectors: {
          size: 1536, // For OpenAI embeddings
          distance: 'Cosine',
        },
        optimizers_config: {
          default_segment_number: 2,
        },
      });

      // Create indexes for filtering
      await this.vectorStore.getQdrantClient().createPayloadIndex('tasks', {
        field_name: 'status',
        field_schema: 'keyword',
      });

      await this.vectorStore.getQdrantClient().createPayloadIndex('tasks', {
        field_name: 'workspaceId',
        field_schema: 'keyword',
      });

      await this.vectorStore.getQdrantClient().createPayloadIndex('tasks', {
        field_name: 'listId',
        field_schema: 'keyword',
      });

      await this.vectorStore.getQdrantClient().createPayloadIndex('tasks', {
        field_name: 'dueDate',
        field_schema: 'float',
      });

      await this.vectorStore.getQdrantClient().createPayloadIndex('tasks', {
        field_name: 'parentId',
        field_schema: 'keyword',
      });

      await this.vectorStore.getQdrantClient().createPayloadIndex('tasks', {
        field_name: 'unplanned',
        field_schema: 'bool',
      });
    }
  }

  async indexTask(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { page: true },
    });
    const taskContent = `id:${task.id} number:#${task.number} status:${task.status || ''} title:${task.page.title}`;
    const embedding = await this.vectorStore.generateEmbedding(taskContent);

    const isPlanned = !!task.startTime || !!task.recurrence;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {
      id: task.id,
      number: task.number,
      title: task.page.title,
      status: task.status,
      workspaceId: task.workspaceId,
      listId: task.listId,
      pageId: task.pageId,
      tags: task.tags,
      dueDate: task.dueDate ? task.dueDate.getTime() : undefined,
      parentId: task.parentId,
      unplanned: isPlanned,
    };

    // Upsert into Qdrant
    await this.vectorStore.getQdrantClient().upsert('tasks', {
      wait: true,
      points: [
        {
          id: task.id,
          vector: embedding,
          payload,
        },
      ],
    });
  }

  async searchTasks(workspaceId: string, options: UnifiedSearchOptionsDto) {
    // Parse the GitHub-style query
    const parsedQuery = parseSearchQuery(options.query);

    // Build filter based on parsed query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {
      must: [
        {
          key: 'workspaceId',
          match: { value: workspaceId },
        },
      ],
    };

    // Add filters from parsed query
    if (parsedQuery.filters.status) {
      filter.must.push({
        key: 'status',
        match: { value: parsedQuery.filters.status },
      });
    }

    if (parsedQuery.filters.listId) {
      filter.must.push({
        key: 'listId',
        match: { value: parsedQuery.filters.listId },
      });
    }

    if (parsedQuery.filters.parentId) {
      filter.must.push({
        key: 'parentId',
        match: { value: parsedQuery.filters.parentId },
      });
    } else if (parsedQuery.filters.isSubtask) {
      filter.must.push({
        key: 'parentId',
        match: { value: { $exists: true } },
      });
    }

    if (parsedQuery.filters.dueDate?.before) {
      filter.must.push({
        key: 'dueDate',
        range: {
          lt: parsedQuery.filters.dueDate.before.getTime(),
        },
      });
    }

    if (parsedQuery.filters.dueDate?.after) {
      filter.must.push({
        key: 'dueDate',
        range: {
          gt: parsedQuery.filters.dueDate.after.getTime(),
        },
      });
    }

    if (parsedQuery.filters.isUnplanned) {
      filter.must.push({
        key: 'unplanned',
        match: { value: true },
      });
    }

    const limit = Number(options.limit) || 20;
    const page = Number(options.page) || 0;
    // Search parameters
    const searchParams = {
      filter,
      limit,
      offset: page * limit,
      with_payload: true,
    };

    console.log(JSON.stringify(searchParams));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let taskIds: Array<Record<string, any>> = [];
    // If we have text to search, do a vector search, otherwise just filter
    if (parsedQuery.textSearch) {
      const vector = await this.vectorStore.generateEmbedding(
        parsedQuery.textSearch,
      );
      const searchResults = await this.vectorStore
        .getQdrantClient()
        .search('tasks', {
          ...searchParams,
          vector,
        });
      taskIds = searchResults.map((point) => ({
        id: point.payload.id,
        score: point.score,
      }));
    } else {
      const { points } = await this.vectorStore
        .getQdrantClient()
        .scroll('tasks', searchParams);

      taskIds = points.map((point) => ({
        id: point.payload.id,
        score: 1.0, // Default score for non-vector searches
      }));
    }

    const tasks = await Promise.all(
      taskIds.map(async ({ id, score }) => {
        const task = await this.tasksService.getTaskById(id);
        return { ...task, relevanceScore: score };
      }),
    );

    return { tasks };
  }

  /**
   * Delete a task from the vector index
   */
  async deleteTaskIndex(taskId: string) {
    await this.vectorStore.getQdrantClient().delete('tasks', {
      wait: true,
      points: [taskId],
    });
  }

  /**
   * Re-index all tasks for a workspace
   */
  async reindexWorkspaceTasks(workspaceId: string) {
    // Process in batches to avoid overwhelming the API
    const tasks = await this.prisma.task.findMany({
      where: { workspaceId, deleted: null },
      select: { id: true },
    });
    const batchSize = 50;
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      await Promise.all(batch.map((task) => this.indexTask(task.id)));
    }
  }

  /**
   * Re-ranks task results using Cohere's rerank API
   * @param query The text query to rerank against
   * @param tasks The tasks to rerank
   * @param limit Maximum number of results to return
   * @returns Reranked tasks with relevance scores
   */
  async reRankTasks(
    query: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tasks: Array<Record<string, any>>,
    limit: number = 20,
  ) {
    if (!query || tasks.length === 0) {
      return tasks;
    }

    // Initialize Cohere client if API key exists
    const cohereApiKey = this.configService.get<string>('COHERE_API_KEY');
    if (!cohereApiKey) {
      return tasks; // No API key, return original tasks
    }

    const cohereClient = new CohereClientV2({
      token: cohereApiKey,
    });

    try {
      // Extract task information for reranking
      const documents = tasks.map(
        (task) =>
          `${task.title || ''} ${task.status || ''} ${task.tags?.join(' ') || ''}`,
      );

      // Call Cohere rerank API
      const rerankedResults = await cohereClient.rerank({
        query,
        documents,
        model: 'rerank-v3.5',
        topN: Math.min(limit, tasks.length),
      });

      // Return reranked tasks with relevance scores
      return rerankedResults.results.map((result) => ({
        ...tasks[result.index],
        score: result.relevanceScore,
      }));
    } catch (error) {
      console.error('Cohere reranking failed:', error);
      return tasks; // Return original tasks on error
    }
  }
}
