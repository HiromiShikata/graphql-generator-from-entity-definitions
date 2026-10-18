import * as fs from 'fs';
import * as path from 'path';

type LockfilePackageEntry = {
  version?: string;
};

type Lockfile = {
  packages?: Record<string, LockfilePackageEntry>;
};

const lockfilePath = path.resolve(__dirname, 'package-lock.json');
const lockfile: Lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf-8'));

const resolvedVersionOf = (packageName: string): string | undefined =>
  lockfile.packages?.[`node_modules/${packageName}`]?.version;

const bumpedDevDependencyTargetVersions: {
  packageName: string;
  targetVersion: string;
}[] = [
  { packageName: '@types/node', targetVersion: '26.6.5' },
  {
    packageName: '@typescript-eslint/eslint-plugin',
    targetVersion: '8.71.1',
  },
  { packageName: '@typescript-eslint/parser', targetVersion: '8.71.1' },
  { packageName: 'eslint', targetVersion: '10.12.0' },
  { packageName: 'prettier', targetVersion: '3.9.10' },
  { packageName: 'ts-jest', targetVersion: '29.4.14' },
];

describe('package-lock.json resolved versions after dependency bump', () => {
  bumpedDevDependencyTargetVersions.forEach(
    ({ packageName, targetVersion }) => {
      it(`resolves ${packageName} to ${targetVersion}`, () => {
        expect(resolvedVersionOf(packageName)).toEqual(targetVersion);
      });
    },
  );
});
