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

const isHandlebarsPackageKey = (packageKey: string): boolean =>
  packageKey === 'node_modules/handlebars' ||
  packageKey.endsWith('/handlebars');

const handlebarsEntries: { packageKey: string; version: string }[] =
  Object.entries(lockfile.packages ?? {})
    .filter(
      ([packageKey, entry]) =>
        isHandlebarsPackageKey(packageKey) && typeof entry.version === 'string',
    )
    .map(([packageKey, entry]) => ({
      packageKey,
      version: entry.version as string,
    }));

const isVulnerableHandlebarsVersion = (version: string): boolean => {
  const [major, minor, patch] = version
    .split('.')
    .map((part) => parseInt(part, 10));
  return major === 4 && (minor < 7 || (minor === 7 && patch <= 9));
};

describe('package-lock.json handlebars resolved version', () => {
  it('contains at least one handlebars package entry with a version field', () => {
    expect(handlebarsEntries.length).toBeGreaterThan(0);
  });

  it('does not resolve handlebars to a version vulnerable to GHSA-8r5x-fm3f-whwj or GHSA-p8wg-vrv2-v86f (>= 4.0.0, <= 4.7.9)', () => {
    handlebarsEntries.forEach(({ packageKey, version }) => {
      expect({
        packageKey,
        version,
        isVulnerable: isVulnerableHandlebarsVersion(version),
      }).toEqual({
        packageKey,
        version,
        isVulnerable: false,
      });
    });
  });
});
