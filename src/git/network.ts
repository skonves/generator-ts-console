import { getText } from '../utils';

export async function getNodeGitIgnore(): Promise<string> {
  return getText(
    'https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore',
  );
}
