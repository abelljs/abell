import path from 'path';
import { fetchBuilder, FileSystemCache } from 'node-fetch-cache';
import archivedRepoContributions from './archivedContributors.json';

const MINUTE = 60 * 1000;
const fetchWithCache = fetchBuilder.withCache(
  new FileSystemCache({
    ttl: 15 * MINUTE,
    cacheDirectory: path.resolve('../.cache')
  })
);

export const getRepoContributions = async (
  repoName:
    | 'abell'
    | 'vscode-abell-language-features'
    | 'abell-starter-minima'
    | 'abell-starter-portfolio'
) => {
  const contributorsData = await fetchWithCache(
    `https://api.github.com/repos/abelljs/${repoName}/contributors`
  ).then((res) => res.json());

  return contributorsData.map((contributor: Record<string, string>) => ({
    login: contributor.login,
    avatar: contributor.avatar_url,
    url: contributor.url,
    contributions: contributor.contributions
  }));
};

export const getContributors = async () => {
  const abellRepoPromise = getRepoContributions('abell');
  const vscodeExtensionRepoPromise = getRepoContributions(
    'vscode-abell-language-features'
  );
  const starterMinimaPromise = getRepoContributions('abell-starter-minima');
  const starterPortfolioPromise = getRepoContributions(
    'abell-starter-portfolio'
  );

  const allContributors = await Promise.all([
    abellRepoPromise,
    vscodeExtensionRepoPromise,
    starterMinimaPromise,
    starterPortfolioPromise
  ]);

  const addedToList: string[] = [];

  const nonDuplicateContributors = [
    ...allContributors.flat(),
    ...archivedRepoContributions
  ].filter((contributor) => {
    // removing duplicate entries of people who contributed to multiple different abell repos
    if (!addedToList.includes(contributor.login)) {
      addedToList.push(contributor.login);
      return true;
    }

    return false;
  });

  return nonDuplicateContributors;
};
