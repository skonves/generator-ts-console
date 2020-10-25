import { getText } from '../utils';

type NpmManifest = {
  'dist-tags': { [tag: string]: string };
};

export async function getNodeGitIgnore(): Promise<string> {
  return getText(
    'https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore',
  );
}
