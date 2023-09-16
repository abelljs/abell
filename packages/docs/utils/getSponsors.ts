import path from 'path';
import { fetchBuilder, FileSystemCache } from 'node-fetch-cache';

export const getSponsors = async () => {
  const MINUTE = 60 * 1000;

  const fetchWithCache = fetchBuilder.withCache(
    new FileSystemCache({
      ttl: 15 * MINUTE,
      cacheDirectory: path.resolve('../.cache')
    })
  );

  const sponsorsData = await fetchWithCache(
    'https://ghs.vercel.app/v2/sponsors/saurabhdaware'
  ).then((res) => res.json());

  // Current and past are swapped - https://github.com/filiptronicek/gh-sponsors-api/issues/27
  const sponsors = sponsorsData.sponsors.past;
  return sponsors;
};
