import axios from 'axios';

export async function createTasks(tasks: any) {
  const batchSize = 10;
  const results = [];
  const batches = [];

  // Split tasks into batches first
  for (let i = 0; i < tasks.length; i += batchSize) {
    batches.push(tasks.slice(i, i + batchSize));
  }

  // Process all batches concurrently with Promise.all
  try {
    const responses = await Promise.all(
      batches.map((batch, index) =>
        axios.post(`/api/v1/tasks/bulk`, { tasks: batch }).catch((error) => {
          console.error(`Error processing batch ${index + 1}:`, error);
          return { data: [] }; // Return empty data on error to continue processing
        }),
      ),
    );

    // Combine all results
    results.push(...responses.flatMap((response) => response.data));
  } catch (error) {
    console.error('Fatal error processing batches');
    // throw error; // Throw fatal errors
  }

  return results;
}

export async function getGithubData(url: string, accessToken: string) {
  return (
    await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
  ).data;
}
