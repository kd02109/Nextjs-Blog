import { pathToFileURL } from 'node:url';

const expectedNodeMajor = 24;
const expectedNpmVersion = '11.12.1';
const contractMessage = `Expected Node.js ${expectedNodeMajor}.x with npm ${expectedNpmVersion}.`;

export function validateToolchain({ nodeVersion, npmUserAgent }) {
  const nodeMajor = Number.parseInt(nodeVersion.replace(/^v/, ''), 10);
  const npmVersion = npmUserAgent?.match(/^npm\/([^\s]+)/)?.[1];

  if (nodeMajor !== expectedNodeMajor || npmVersion !== expectedNpmVersion) {
    throw new Error(
      `${contractMessage} Received ${nodeVersion} with ${npmVersion ? `npm ${npmVersion}` : 'an unknown package manager'}.`,
    );
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(process.argv[1]).href
  : undefined;

if (import.meta.url === invokedPath) {
  try {
    validateToolchain({
      nodeVersion: process.version,
      npmUserAgent: process.env.npm_config_user_agent,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : contractMessage);
    process.exitCode = 1;
  }
}
