import { getJson } from '../utils';

type NpmManifest = {
  'dist-tags': { [tag: string]: string };
};

export async function getTypescriptVersions(): Promise<
  {
    version: string;
    tag: string;
  }[]
> {
  const { 'dist-tags': tags } = await getJson<NpmManifest>(
    'https://registry.npmjs.com/typescript',
  );

  return Object.keys(tags).map(tag => ({ version: tags[tag], tag }));
}
