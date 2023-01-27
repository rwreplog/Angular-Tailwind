const { execSync } = require('child_process');
const { argv } = require('process');

function getCommand(env = 'npm', fix = false) {
  let isFilesToCheck = false;

  let compareTo;
  switch (env) {
    case 'npm':
      compareTo = '"HEAD"';
      break;
    case 'husky':
      compareTo = '--staged';
      break;
    default:
      compareTo = '"HEAD"';
  }

  // Docs for --diff-filter option: https://git-scm.com/docs/git-diff#Documentation/git-diff.txt---diff-filterACDMRTUXB82308203
  // Docs for -z option: https://git-scm.com/docs/git-diff#Documentation/git-diff.txt--z
  const files = execSync(`git diff ${compareTo} --diff-filter=d --name-only`)
    .toString()
    .trim()
    .split('\n');

  let cmd = `ng lint angular-tailwind `;

  let fileCount = 0;
  for (const file of files) {
    if (/.(ts|html)$/.test(file)) {
      cmd += `--lint-file-patterns=${file} `;
      console.log(file);
      fileCount++;
      isFilesToCheck = true;
    }
  }
  if (fileCount === 0) {
    console.log('No files needed linting...\n');
    process.exit(0);
  }
  console.log(`Linting ${fileCount} files...\n`);

  if (fix) {
    cmd += '--fix';
  }

  return cmd;
}

/* Read input args */
const args = require('minimist')(process.argv.slice(2));

/* Put together command to run */
cmd = getCommand(args.env, args.fix);
console.log(cmd);

/* Run command */
try {
  execSync(cmd.trim(), { stdio: 'inherit' });
} catch (err) {
  if (args.env === 'husky') {
    process.exit(1);
  }
}
