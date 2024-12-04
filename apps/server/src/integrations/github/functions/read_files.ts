/** Copyright (c) 2023, Mira, all rights reserved. **/

import axios from 'axios';

import { getGithubHeaders } from '../utils';
import { ChangedFile, FileEntry } from './types';

const textFileExtensions = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.html',
  '.css',
  '.json',
  '.c',
  '.h',
  '.cpp',
  '.cc',
  '.rs',
  '.go',
  '.java',
  '.py',
  '.rb',
];
function isTextFile(fileName: string): boolean {
  const ext = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2); // Extract file extension
  return textFileExtensions.includes(`.${ext.toLowerCase()}`);
}

export async function getAllFilesAndRead(
  owner: string,
  repo: string,
  path: string,
  accessToken: string,
): Promise<FileEntry[]> {
  const textFiles: FileEntry[] = [];

  try {
    console.log(accessToken);
    // Get the repository's content tree
    const { data: contentTree } = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      getGithubHeaders(accessToken),
    );

    // Ensure contentTree is an array of files
    if (!Array.isArray(contentTree)) {
      console.error('Error: Content tree is not an array');
      return [];
    }

    // Loop through the content tree entries and read files
    for (const entry of contentTree) {
      if (entry.type === 'file' && isTextFile(entry.name)) {
        const response = await axios.get(
          entry.download_url as string,
          getGithubHeaders(accessToken),
        );
        const fileContent = response.data;

        const fileEntry = {
          name: path ? `${path}/${entry.name}` : entry.name,
          content: fileContent,
        };

        textFiles.push(fileEntry);

        // You can process or save the file content as needed
      } else if (entry.type === 'dir') {
        // Recursively fetch files from subdirectories
        const subdirectoryTextFiles = await getAllFilesAndRead(
          owner,
          repo,
          entry.path,
          accessToken,
        );

        textFiles.push(...subdirectoryTextFiles);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }

  return textFiles;
}

export async function getChangedFilesAndRead(
  owner: string,
  repo: string,
  commitSha: string,
  accessToken: string,
): Promise<FileEntry[]> {
  const textFiles: FileEntry[] = [];

  try {
    // Get the list of changed files in the commit
    const { data: commitData } = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`,
      getGithubHeaders(accessToken),
    );

    const changedFiles = commitData.files as ChangedFile[];

    // Process only changed files
    for (const file of changedFiles) {
      if (isTextFile(file.filename)) {
        try {
          const response = await axios.get(
            `https://raw.githubusercontent.com/${owner}/${repo}/${commitSha}/${file.filename}`,
            getGithubHeaders(accessToken),
          );

          const fileEntry = {
            name: file.filename,
            content: response.data,
          };

          textFiles.push(fileEntry);
        } catch (fileError) {
          console.error(`Error reading file ${file.filename}:`, fileError);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }

  return textFiles;
}
