// metro.config.js
// Explicit project root prevents Metro from traversing up into apps/ or MyProject/
// and failing with "expected package.json does not exist" in nested directory structures.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname; // F:\MyProject\apps\app

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Restrict Metro's file watcher strictly to this app folder.
// Without this, Metro walks up to apps/ looking for a workspace root
// and errors because apps/package.json does not exist.
config.watchFolders = [projectRoot];

module.exports = config;
