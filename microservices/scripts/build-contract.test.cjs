const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { readFileSync, readdirSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const lock = readJson(path.join(root, "package-lock.json"));
const graph = JSON.parse(
  execFileSync(
    process.execPath,
    [require.resolve("turbo/bin/turbo"), "run", "build", "--dry=json"],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, TURBO_TELEMETRY_DISABLED: "1" },
    },
  ),
);

function importsCommon(directory) {
  return readdirSync(directory, { withFileTypes: true }).some((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory()
      ? importsCommon(file)
      : /\.[cm]?tsx?$/.test(entry.name) &&
          /['"]@project-pc\/common(?:\/[^'"]*)?['"]/.test(
            readFileSync(file, "utf8"),
          );
  });
}

for (const entry of readdirSync(path.join(root, "apps"), {
  withFileTypes: true,
})) {
  const key = `apps/${entry.name}`;
  if (!entry.isDirectory() || !lock.packages[key]) continue;
  const directory = path.join(root, key);
  if (!importsCommon(path.join(directory, "src"))) continue;
  const manifest = readJson(path.join(directory, "package.json"));

  test(`${manifest.name}: common is declared, locked and built first`, () => {
    const dependency = manifest.dependencies?.["@project-pc/common"];
    assert.ok(
      dependency,
      `${key}/package.json must declare @project-pc/common`,
    );
    assert.equal(
      lock.packages[key].dependencies?.["@project-pc/common"],
      dependency,
    );
    const build = graph.tasks.find(
      (task) => task.taskId === `${manifest.name}#build`,
    );
    assert.ok(
      build?.dependencies.includes("@project-pc/common#build"),
      `${manifest.name}#build must wait for @project-pc/common#build`,
    );
  });
}
