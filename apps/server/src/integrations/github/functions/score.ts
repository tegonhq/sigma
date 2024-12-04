/** Copyright (c) 2023, Mira, all rights reserved. **/

import axios from 'axios';
import { DateTime } from 'luxon';

export interface Commit {
  commit: {
    author: {
      date: string;
    };
  };
}

export interface ScoreValue {
  commitCount: number;
  daysSinceLastModified: number;
  filePath: string;
}

export interface ScoreValueForFile {
  commitCount: number;
  daysSinceLastModified: number;
}

export interface Score {
  score: number;
  filePath: string;
}

// Function to fetch commits for a specific file
async function getCommitsForFile(
  owner: string,
  repo: string,
  path: string,
  accessToken: string,
): Promise<Commit[]> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits`;

  try {
    const response = await axios.get(apiUrl, {
      params: {
        path,
      },
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    if (response.status === 200) {
      const commits = response.data;
      return commits;
    }
    return [];
  } catch (error) {
    return [];
  }
}

export async function computeScore(
  owner: string,
  repo: string,
  filePath: string,
  accessToken: string,
): Promise<ScoreValue> {
  const commits = await getCommitsForFile(owner, repo, filePath, accessToken);
  const scoreFactor = getFactors(commits);
  return {
    ...scoreFactor,
    filePath,
  };
}

function getFactors(commits: Commit[]): ScoreValueForFile {
  const commitCount: number = commits.length + 1;
  const earliestCommit = DateTime.fromISO(commits[0].commit.author.date);
  const currentDateTime = DateTime.now();
  const daysSinceLastModified =
    Math.max(currentDateTime.diff(earliestCommit, 'hours').hours, 0) + 1;

  return {
    commitCount,
    daysSinceLastModified,
  };
}

function convertToPercentiles(values: number[], maxPercentile = 0.1): number[] {
  const sortedValues = [...values].sort((a, b) => a - b);
  const n = sortedValues.length;

  const percentileMapping: Record<number, number> = {};
  sortedValues.forEach((value, index) => {
    percentileMapping[value] = (index / n) * maxPercentile;
  });

  const percentiles = values.map((value) => percentileMapping[value]);
  return percentiles;
}

export function getScores(scoreFactors: ScoreValue[]): Score[] {
  const lineCountScores = scoreFactors.map(() => 1);
  const commitCountScores = scoreFactors.map((x) => x.commitCount);
  const daysSinceLastModifiedScores = scoreFactors.map(
    (x) => x.daysSinceLastModified,
  );

  const lineCountPercentiles = convertToPercentiles(lineCountScores, 1);
  const commitCountPercentiles = convertToPercentiles(commitCountScores, 1);
  const daysSinceLastModifiedPercentiles = convertToPercentiles(
    daysSinceLastModifiedScores,
    1,
  );

  const scores = lineCountPercentiles.map(
    (lineCountPercentile, index) =>
      lineCountPercentile +
      commitCountPercentiles[index] +
      daysSinceLastModifiedPercentiles[index],
  );

  return convertToPercentiles(scores, 0.1).map((score, index) => ({
    score,
    filePath: scoreFactors[index].filePath,
  }));
}
