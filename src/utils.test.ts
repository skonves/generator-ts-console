import { compareScriptNames } from './utils';

const testCases: [string, string][] = [
  ['a', 'z'],
  ['prebuild', 'build'],
  ['prebuild', 'build:suffix'],
  ['build', 'postbuild'],
  ['build:suffix', 'postbuild'],
  ['build:aa', 'build:bb'],
  ['build', 'preclean'],
  ['postbuild', 'preclean'],
];

describe('compareScriptNames', () => {
  it.each(testCases)("'%s' -> '%s'", (a, b) => {
    expect(compareScriptNames(a, b)).toEqual(-1);
    expect(compareScriptNames(b, a)).toEqual(1);
  });
});
