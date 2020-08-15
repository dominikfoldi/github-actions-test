/**
 *  This script adds the latest version's changelog from a release branch to the CHANGELOG.md file on the master branch.
 */

const { exec, execSync } = require("child_process");
const fs = require("fs");

const CHANGELOG_PATH = "CHANGELOG.md";

// --- Get the release branch from args
var myArgs = process.argv.slice(2);
if (myArgs.length < 1) {
  logError("Please add a release branch name as a parameter");
  return process.exit(1);
} else if (myArgs.length > 1) {
  logError("Please add only one release branch name as a parameter");
  return process.exit(1);
}
const releaseBranchName = myArgs[0];

// --- Store the local (master) changelog in memory
let originalChangelog;
try {
  originalChangelog = fs.readFileSync(CHANGELOG_PATH, "utf-8");
} catch (error) {
  logError(error);
  return process.exit(1);
}

// --- Get the release changelog
try {
  execSync("git fetch");
} catch (error) {
  logError(error);
  return process.exit(1);
}
exec(`git restore -s origin/${releaseBranchName} -- ${CHANGELOG_PATH}`, (error, stdout, stderr) => {
  if (error) {
    restoreOriginalChangelog();
    logError(error);
    return process.exit(1);
  }

  if (stderr) {
    if (!stderr.toLowerCase().includes("updated")) {
      restoreOriginalChangelog();
      logError(error);
      return process.exit(1);
    }
  }

  // --- Store the release changelog in memory
  let releaseChangelog;
  try {
    releaseChangelog = fs.readFileSync(CHANGELOG_PATH, "utf-8");
  } catch (error) {
    restoreOriginalChangelog();
    logError(error);
    return process.exit(1);
  }

  // --- Get the latest update from the release changelog
  const firstTagIndex = releaseChangelog.indexOf("## v");
  const secondTagIndex = releaseChangelog.indexOf("## v", firstTagIndex + 1);
  const latestUpdate = releaseChangelog.substring(firstTagIndex, secondTagIndex);

  // --- Create the new changelog
  const previousVersionStartIndex = originalChangelog.indexOf("## v");
  const newChangelogText =
    originalChangelog.substring(0, previousVersionStartIndex) +
    latestUpdate.trim().replace("\n\n\n", "\n\n") +
    "\n\n" +
    originalChangelog.substring(previousVersionStartIndex);

  // --- Update the old changelog with the new one
  try {
    fs.writeFileSync(CHANGELOG_PATH, newChangelogText);
  } catch (error) {
    restoreOriginalChangelog();
    logError(error);
    return process.exit(1);
  }
  console.log(
    "\x1b[32m%s\x1b[0m",
    `SUCCESS: The latest changes from branch ${releaseBranchName} has been added to the master CHANGELOG.md!`
  );
});

function restoreOriginalChangelog() {
  try {
    fs.writeFileSync(CHANGELOG_PATH, originalChangelog);
  } catch (error) {
    logError(error);
    return process.exit(1);
  }
}

function logError(error) {
  console.error("\x1b[31m%s\x1b[0m", `ERROR: ${error}`);
}
