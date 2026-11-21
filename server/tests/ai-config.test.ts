// Guards the Anthropic model ID the AI question generator falls back to when
// AI_QUESTIONS_MODEL isn't set. Regression test for a production 404 caused
// by a stale model ID (claude-sonnet-4-5, retired) -- see server/src/questions/ai/config.ts.
import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { loadAiQuestionsConfig } from "../src/questions/ai/config.js";

const savedModel = process.env.AI_QUESTIONS_MODEL;

describe("loadAiQuestionsConfig", () => {
  afterEach(() => {
    if (savedModel === undefined) {
      delete process.env.AI_QUESTIONS_MODEL;
    } else {
      process.env.AI_QUESTIONS_MODEL = savedModel;
    }
  });

  it("defaults anthropicModel to claude-sonnet-5-5 when AI_QUESTIONS_MODEL is unset", () => {
    delete process.env.AI_QUESTIONS_MODEL;
    const config = loadAiQuestionsConfig();
    assert.equal(config.anthropicModel, "claude-sonnet-5-5");
  });

  it("still allows AI_QUESTIONS_MODEL to override the default", () => {
    process.env.AI_QUESTIONS_MODEL = "some-other-model";
    const config = loadAiQuestionsConfig();
    assert.equal(config.anthropicModel, "some-other-model");
  });
});
