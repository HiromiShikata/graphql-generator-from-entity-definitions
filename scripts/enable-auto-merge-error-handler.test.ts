import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
import * as path from 'path';

const scriptPath = path.resolve(
  __dirname,
  'enable-auto-merge-error-handler.sh',
);
const opts: ExecSyncOptionsWithStringEncoding = { encoding: 'utf-8' };

const run = (json: string): { output: string; exitCode: number } => {
  try {
    const output = execSync(
      `echo '${json.replace(/'/g, "'\\''")}' | bash '${scriptPath}'`,
      opts,
    );
    return { output, exitCode: 0 };
  } catch (e: unknown) {
    const err = e as { stdout?: string; status?: number };
    return { output: err.stdout ?? '', exitCode: err.status ?? 1 };
  }
};

describe('enable-auto-merge-error-handler.sh', () => {
  it('exits 0 and reports success when response has no errors field', () => {
    const { output, exitCode } = run(
      '{"data":{"enablePullRequestAutoMerge":{"clientMutationId":null}}}',
    );
    expect(exitCode).toBe(0);
    expect(output).toContain('Auto merge enabled successfully');
  });

  it('exits 0 with warning for RATE_LIMIT error type', () => {
    const { output, exitCode } = run(
      '{"errors":[{"type":"RATE_LIMIT","message":"rate limit exceeded"}]}',
    );
    expect(exitCode).toBe(0);
    expect(output).toContain('Warning:');
  });

  it('exits 0 with warning when error message contains "unstable"', () => {
    const { output, exitCode } = run(
      '{"errors":[{"type":"OTHER","message":"pull request is in unstable state"}]}',
    );
    expect(exitCode).toBe(0);
    expect(output).toContain('Warning:');
  });

  it('exits 0 with warning when error message contains "already" and "auto merge"', () => {
    const { output, exitCode } = run(
      '{"errors":[{"type":"OTHER","message":"already has auto merge enabled"}]}',
    );
    expect(exitCode).toBe(0);
    expect(output).toContain('Warning:');
  });

  it('exits 1 for unrecognised error', () => {
    const { output, exitCode } = run(
      '{"errors":[{"type":"UNKNOWN","message":"something went wrong"}]}',
    );
    expect(exitCode).toBe(1);
    expect(output).toContain('Failed to enable auto merge:');
    expect(output).toContain('something went wrong');
  });
});
