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

type VersionTuple = [number, number, number];

const parseVersion = (version: string): VersionTuple => {
  const [major, minor, patch] = version
    .split('.')
    .map((part) => parseInt(part, 10));
  return [major, minor, patch];
};

const compareVersionTuples = (a: VersionTuple, b: VersionTuple): number => {
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) {
      return a[index] - b[index];
    }
  }
  return 0;
};

const isAtMost = (
  version: string,
  upperBoundInclusive: VersionTuple,
): boolean =>
  compareVersionTuples(parseVersion(version), upperBoundInclusive) <= 0;

const isAtLeast = (
  version: string,
  lowerBoundInclusive: VersionTuple,
): boolean =>
  compareVersionTuples(parseVersion(version), lowerBoundInclusive) >= 0;

const isBelow = (version: string, upperBoundExclusive: VersionTuple): boolean =>
  compareVersionTuples(parseVersion(version), upperBoundExclusive) < 0;

const isWithinRange = (
  version: string,
  lowerBoundInclusive: VersionTuple,
  upperBoundExclusive: VersionTuple,
): boolean =>
  isAtLeast(version, lowerBoundInclusive) &&
  isBelow(version, upperBoundExclusive);

const isIpAddressPackageKey = (packageKey: string): boolean =>
  packageKey === 'node_modules/ip-address' ||
  packageKey.endsWith('/ip-address');

const ipAddressEntries: { packageKey: string; version: string }[] =
  Object.entries(lockfile.packages ?? {})
    .filter(
      ([packageKey, entry]) =>
        isIpAddressPackageKey(packageKey) && typeof entry.version === 'string',
    )
    .map(([packageKey, entry]) => ({
      packageKey,
      version: entry.version as string,
    }));

const isVulnerableIpAddressVersion = (version: string): boolean =>
  isAtMost(version, [10, 3, 0]);

const isUndiciPackageKey = (packageKey: string): boolean =>
  packageKey === 'node_modules/undici' || packageKey.endsWith('/undici');

const undiciEntries: { packageKey: string; version: string }[] = Object.entries(
  lockfile.packages ?? {},
)
  .filter(
    ([packageKey, entry]) =>
      isUndiciPackageKey(packageKey) && typeof entry.version === 'string',
  )
  .map(([packageKey, entry]) => ({
    packageKey,
    version: entry.version as string,
  }));

const isVulnerableUndiciVersion = (version: string): boolean =>
  isWithinRange(version, [7, 24, 1], [7, 29, 1]) ||
  isWithinRange(version, [8, 0, 0], [8, 10, 2]);

const braceExpansionEntries: { packageKey: string; version: string }[] =
  Object.entries(lockfile.packages ?? {})
    .filter(
      ([packageKey, entry]) =>
        packageKey === 'node_modules/brace-expansion' &&
        typeof entry.version === 'string',
    )
    .map(([packageKey, entry]) => ({
      packageKey,
      version: entry.version as string,
    }));

const isVulnerableBraceExpansionVersionGhsa6j4fFj2gMc7p = (
  version: string,
): boolean =>
  isWithinRange(version, [4, 0, 0], [5, 0, 10]) ||
  isWithinRange(version, [3, 0, 0], [3, 0, 7]) ||
  isWithinRange(version, [2, 0, 0], [2, 1, 5]) ||
  isBelow(version, [1, 1, 19]);

const isVulnerableBraceExpansionVersionGhsaQhr7859cM2p7 = (
  version: string,
): boolean =>
  isWithinRange(version, [4, 0, 0], [5, 0, 11]) ||
  isWithinRange(version, [3, 0, 0], [3, 0, 8]) ||
  isWithinRange(version, [2, 0, 0], [2, 1, 6]) ||
  isBelow(version, [1, 1, 20]);

describe('package-lock.json ip-address resolved version', () => {
  it('contains at least one ip-address package entry with a version field', () => {
    expect(ipAddressEntries.length).toBeGreaterThan(0);
  });

  it('does not resolve ip-address to a version vulnerable to GHSA-mwp4-54f8-5fhr (<= 10.3.0)', () => {
    ipAddressEntries.forEach(({ packageKey, version }) => {
      expect({
        packageKey,
        version,
        isVulnerable: isVulnerableIpAddressVersion(version),
      }).toEqual({
        packageKey,
        version,
        isVulnerable: false,
      });
    });
  });
});

describe('package-lock.json undici resolved version', () => {
  it('contains at least one undici package entry with a version field', () => {
    expect(undiciEntries.length).toBeGreaterThan(0);
  });

  it('does not resolve undici to a version vulnerable to GHSA-w293-vg96-wgc3 (>= 7.24.1, < 7.29.1 or >= 8.0.0, < 8.10.2)', () => {
    undiciEntries.forEach(({ packageKey, version }) => {
      expect({
        packageKey,
        version,
        isVulnerable: isVulnerableUndiciVersion(version),
      }).toEqual({
        packageKey,
        version,
        isVulnerable: false,
      });
    });
  });
});

describe('package-lock.json top-level brace-expansion resolved version (scoped to node_modules/brace-expansion only; the npm-bundled nested instance at node_modules/npm/node_modules/brace-expansion is tracked separately)', () => {
  it('contains the top-level node_modules/brace-expansion package entry with a version field', () => {
    expect(braceExpansionEntries.length).toBeGreaterThan(0);
  });

  it('does not resolve the top-level brace-expansion to a version vulnerable to GHSA-6j4f-fj2g-mc7p', () => {
    braceExpansionEntries.forEach(({ packageKey, version }) => {
      expect({
        packageKey,
        version,
        isVulnerable:
          isVulnerableBraceExpansionVersionGhsa6j4fFj2gMc7p(version),
      }).toEqual({
        packageKey,
        version,
        isVulnerable: false,
      });
    });
  });

  it('does not resolve the top-level brace-expansion to a version vulnerable to GHSA-qhr7-859c-m2p7', () => {
    braceExpansionEntries.forEach(({ packageKey, version }) => {
      expect({
        packageKey,
        version,
        isVulnerable:
          isVulnerableBraceExpansionVersionGhsaQhr7859cM2p7(version),
      }).toEqual({
        packageKey,
        version,
        isVulnerable: false,
      });
    });
  });
});
