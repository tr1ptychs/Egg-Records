import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LoaderFunctionArgs } from "@remix-run/node";

import type { User, UserAchievements } from "~/types/user";
import type { Score } from "~/types/score";

import { loader } from "~/routes/u.$username";

import * as userModel from "~/models/user.server";
import * as scoreModel from "~/models/score.server";
import * as auth from "~/utils/auth.server";

vi.mock("~/models/user.server");
vi.mock("~/models/score.server");
vi.mock("~/utils/auth.server");

const mockedUser = vi.mocked(userModel, { partial: true });
const mockedScore = vi.mocked(scoreModel, { partial: true });
const mockedAuth = vi.mocked(auth, { partial: true });

const mkArgs = (
  overrides: Partial<LoaderFunctionArgs> = {}
): LoaderFunctionArgs => ({
  request: new Request("http://localhost/u/alice"),
  params: { username: "alice" },
  context: {},
  ...overrides,
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe("u.$username loader", () => {
  it("404s when username missing", async () => {
    await expect(loader(mkArgs({ params: {} }))).rejects.toMatchObject({
      status: 404,
    });
  });

  it("404s when user not found", async () => {
    mockedUser.getUser.mockResolvedValue(null);
    await expect(loader(mkArgs())).rejects.toMatchObject({
      status: 404,
    });
  });

  it("computes privacy flags for public profile: other user, not private", async () => {
    mockedUser.getUser.mockResolvedValue({
      id: 1,
      username: "alice",
    } as User);
    mockedAuth.getUserAuth.mockResolvedValue({
      id: 2,
      username: "bob",
    } as User);
    mockedUser.getUserPrivacy.mockResolvedValue(false);
    mockedScore.getScores.mockResolvedValue([] as Score[]);
    mockedUser.getUserAchievements.mockResolvedValue({
      bigRun: "no-display",
      grizzBadge: "no-display",
      eggstraWork: "no-display",
    } as UserAchievements);

    const res = await loader(mkArgs());
    const data = await res.json();

    expect(data.isPrivate).toBe(false);
    expect(data.isOwnProfile).toBe(false);
    expect(data.canViewProfile).toBe(true);
  });

  it("computes privacy flags for public profile: other user, private", async () => {
    mockedUser.getUser.mockResolvedValue({
      id: 1,
      username: "alice",
    } as User);
    mockedAuth.getUserAuth.mockResolvedValue({
      id: 2,
      username: "bob",
    } as User);
    mockedUser.getUserPrivacy.mockResolvedValue(true);
    mockedScore.getScores.mockResolvedValue([] as Score[]);
    mockedUser.getUserAchievements.mockResolvedValue({
      bigRun: "no-display",
      grizzBadge: "no-display",
      eggstraWork: "no-display",
    } as UserAchievements);

    const res = await loader(mkArgs());
    const data = await res.json();

    expect(data.isPrivate).toBe(true);
    expect(data.isOwnProfile).toBe(false);
    expect(data.canViewProfile).toBe(false);
  });

  it("computes privacy flags for public profile: same user, private", async () => {
    mockedUser.getUser.mockResolvedValue({
      id: 1,
      username: "alice",
    } as User);
    mockedAuth.getUserAuth.mockResolvedValue({
      id: 1,
      username: "alice",
    } as User);
    mockedUser.getUserPrivacy.mockResolvedValue(true);
    mockedScore.getScores.mockResolvedValue([] as Score[]);
    mockedUser.getUserAchievements.mockResolvedValue({
      bigRun: "no-display",
      grizzBadge: "no-display",
      eggstraWork: "no-display",
    } as UserAchievements);

    const res = await loader(mkArgs());
    const data = await res.json();

    expect(data.isPrivate).toBe(true);
    expect(data.isOwnProfile).toBe(true);
    expect(data.canViewProfile).toBe(true);
  });

  it("computes privacy flags for public profile: same user, private", async () => {
    mockedUser.getUser.mockResolvedValue({
      id: 1,
      username: "alice",
    } as User);
    mockedAuth.getUserAuth.mockResolvedValue({
      id: 1,
      username: "alice",
    } as User);
    mockedUser.getUserPrivacy.mockResolvedValue(false);
    mockedScore.getScores.mockResolvedValue([] as Score[]);
    mockedUser.getUserAchievements.mockResolvedValue({
      bigRun: "no-display",
      grizzBadge: "no-display",
      eggstraWork: "no-display",
    } as UserAchievements);

    const res = await loader(mkArgs());
    const data = await res.json();

    expect(data.isPrivate).toBe(false);
    expect(data.isOwnProfile).toBe(true);
    expect(data.canViewProfile).toBe(true);
  });

  it("computes best regular/nightless/overall scores per map", async () => {
    mockedUser.getUser.mockResolvedValue({
      id: 1,
      username: "alice",
    } as User);
    mockedAuth.getUserAuth.mockResolvedValue({
      id: 1,
      username: "alice",
    } as User);
    mockedUser.getUserPrivacy.mockResolvedValue(false);
    mockedUser.getUserAchievements.mockResolvedValue({
      bigRun: "no-display",
      grizzBadge: "no-display",
      eggstraWork: "no-display",
    } as UserAchievements);

    mockedScore.getScores.mockResolvedValue([
      { map: "Sockeye Station", score: 100, nightless: false } as Score,
      { map: "Sockeye Station", score: 120, nightless: true } as Score,
      { map: "Jammin' Salmon Junction", score: 100, nightless: false } as Score,
      { map: "Jammin' Salmon Junction", score: 200, nightless: false } as Score,
      { map: "Jammin' Salmon Junction", score: 120, nightless: false } as Score,
    ]);

    const res = await loader(mkArgs());
    const data = await res.json();

    const sockeye = data.mapScores["Sockeye Station"];
    expect(sockeye.regular.score).toBe(100);
    expect(sockeye.nightless.score).toBe(120);

    const jammin = data.mapScores["Jammin' Salmon Junction"];
    expect(jammin.regular.score).toBe(200);
    expect(jammin.nightless.score).toBe(null);
  });
});
