#!/usr/bin/env node

const fs = require("fs");

const CHANGELOG_PATH = "CHANGELOG.md";

const changelogFile = fs.readFileSync(CHANGELOG_PATH, "utf-8");

const latestVersionStartIndex = changelogFile.indexOf("###");
const previousVersionStartIndex = changelogFile.indexOf("## v", latestVersionStartIndex);

const latestChangelog = changelogFile.substring(latestVersionStartIndex, previousVersionStartIndex);

console.log(latestChangelog.trim());
