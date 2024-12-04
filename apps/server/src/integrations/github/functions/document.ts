/** Copyright (c) 2023, Mira, all rights reserved. **/

import { chunkCode } from './chunk';
import { Snippet, Document, FileEntry } from './types';

export async function createDocuments(
  files: FileEntry[],
  owner: string,
  repo: string,
  token: string,
) {
  console.log(owner, repo, token);
  // const scoreFactors: ScoreValue[] = [];
  // await Promise.all(
  //   files.map(async (file) => {
  //     const score = await computeScore(owner, repo, file.name, token);
  //     scoreFactors.push(score);
  //   }),
  // );

  // const scores = getScores(scoreFactors);

  let totalDocuments: Document[] = [];

  await Promise.all(
    files.map(async (file) => {
      const snippets = chunkCode(file.content, file.name);
      // const scoreForThis = scores.find((score) => score.filePath === file.name);
      const documents = await documentsForSnippets(
        snippets,
        // scoreForThis?.score as number,
        1,
      );

      totalDocuments = [...totalDocuments, ...documents];
    }),
  );

  return totalDocuments;
}

export async function documentsForSnippets(
  snippets: Snippet[],
  score: number,
): Promise<Document[]> {
  const documents = await Promise.all(
    snippets.map(async (snippet) => {
      return {
        ...snippet,
        score,
      };
    }),
  );

  return documents;
}
