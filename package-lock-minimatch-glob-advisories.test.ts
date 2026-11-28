import * as fs from 'fs';
import * as path from 'path';

type LockfilePackageEntry = {
  version?: string;
};

type Lockfile = {
  packages?: Record<string, LockfilePackageEntry>;
};

type VersionTuple = [number, number, number];

const lockfilePath = path.resolve(__dirname, 'package-lock.json');
const lockfile: Lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf-8'));

const parseVersion = (version: string): VersionTuple => {
  const [major, minor, patch] = version
    .split('.')
    .map((part) => parseInt(part, 10));
  return [major, minor, patch];
};

const compareVersions = (left: VersionTuple, right: VersionTuple): number => {
  for (let index = 0; index < 3; index++) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }
  return 0;
};

const isWithinRange = (
  version: string,
  lowerBoundInclusive: VersionTuple,
  upperBoundExclusive: VersionTuple,
): boolean => {
  const parsed = parseVersion(version);
  return (
    compareVersions(parsed, lowerBoundInclusive) >= 0 &&
    compareVersions(parsed, upperBoundExclusive) < 0
  );
};

const isVulnerableMinimatchVersion = (version: string): boolean =>
  isWithinRange(version, [7, 0, 0], [11, 0, 1]);

const isVulnerableGlobVersion = (version: string): boolean =>
  isWithinRange(version, [9, 0, 0], [14, 0, 2]);

const isBundledNpmPackageKey = (packageKey: string): boolean =>
  packageKey.startsWith('node_modules/npm/');

const isMinimatchPackageKey = (packageKey: string): boolean =>
  packageKey === 'node_modules/minimatch' ||
  packageKey.endsWith('/node_modules/minimatch');

const isGlobPackageKey = (packageKey: string): boolean =>
  packageKey === 'node_modules/glob' ||
  packageKey.endsWith('/node_modules/glob');

const minimatchEntries: { packageKey: string; version: string }[] =
  Object.entries(lockfile.packages ?? {})
    .filter(
      ([packageKey, entry]) =>
        isMinimatchPackageKey(packageKey) &&
        !isBundledNpmPackageKey(packageKey) &&
        typeof entry.version === 'string',
    )
    .map(([packageKey, entry]) => ({
      packageKey,
      version: entry.version as string,
    }));

const globEntries: { packageKey: string; version: string }[] = Object.entries(
  lockfile.packages ?? {},
)
  .filter(
    ([packageKey, entry]) =>
      isGlobPackageKey(packageKey) &&
      !isBundledNpmPackageKey(packageKey) &&
      typeof entry.version === 'string',
  )
  .map(([packageKey, entry]) => ({
    packageKey,
    version: entry.version as string,
  }));

describe('package-lock.json minimatch resolved versions (GHSA-g3hv-75wg-m249)', () => {
  it('contains at least one minimatch package entry with a version field', () => {
    expect(minimatchEntries.length).toBeGreaterThan(0);
  });

  it('does not resolve minimatch to a version vulnerable to GHSA-g3hv-75wg-m249 (>= 7.0.0, < 11.0.1), outside the bundled npm package', () => {
    minimatchEntries.forEach(({ packageKey, version }) => {
      expect({
        packageKey,
        version,
        isVulnerable: isVulnerableMinimatchVersion(version),
      }).toEqual({
        packageKey,
        version,
        isVulnerable: false,
      });
    });
  });
});

describe('package-lock.json glob resolved versions (GHSA-3g3m-2fjr-6pw4)', () => {
  it('contains at least one glob package entry with a version field', () => {
    expect(globEntries.length).toBeGreaterThan(0);
  });

  it('does not resolve glob to a version vulnerable to GHSA-3g3m-2fjr-6pw4 (>= 9.0.0, <= 14.0.1), outside the bundled npm package', () => {
    globEntries.forEach(({ packageKey, version }) => {
      expect({
        packageKey,
        version,
        isVulnerable: isVulnerableGlobVersion(version),
      }).toEqual({
        packageKey,
        version,
        isVulnerable: false,
      });
    });
  });
});
