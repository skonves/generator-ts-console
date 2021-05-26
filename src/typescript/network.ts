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
  const url = 'https://registry.npmjs.com/typescript';
  try {
    const { 'dist-tags': tags } = await getJson<NpmManifest>(url);

    return Object.keys(tags).map((tag) => ({ version: tags[tag], tag }));
  } catch {
    throw new Error(`Cannot GET package data from ${url}`);
  }
}
