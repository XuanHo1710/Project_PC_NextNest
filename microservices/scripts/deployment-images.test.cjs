const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const root = path.resolve(__dirname, "../..");
const compose = readFileSync(path.join(root, "docker-compose.yml"), "utf8");
const workflow = readFileSync(
  path.join(root, ".github/workflows/workflow-deploy.yml"),
  "utf8",
);

// These files currently use literal image names and multiline tags. Fail if
// that convention changes, so this check cannot silently pass without images.
const deployedImages = [
  ...compose.matchAll(/^\s+image:\s+(\S*\/project-chat-social-\S+)\s*$/gm),
].map((match) => match[1]);
const publishedImages = workflow
  .split(/^\s*- name:/m)
  .filter(
    (step) =>
      /uses: docker\/build-push-action@/.test(step) && /push: true/.test(step),
  )
  .flatMap((step) =>
    [...step.matchAll(/^\s+(\S*\/project-chat-social-\S+:latest)\s*$/gm)].map(
      (match) => match[1],
    ),
  );

test("every deployed application image is published by CI", () => {
  assert.ok(
    deployedImages.length > 0,
    "No literal application images found in Compose",
  );
  assert.ok(publishedImages.length > 0, "No published latest tags found in CI");
  for (const image of deployedImages) {
    assert.ok(
      publishedImages.includes(image),
      `Compose pulls ${image}, but CI does not publish it`,
    );
  }
  assert.deepEqual(
    [...new Set(deployedImages)].sort(),
    [...new Set(publishedImages)].sort(),
  );
});
