import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LoaderFunctionArgs } from "@remix-run/node";

import type { User, UserAchievements } from "~/types/user";

import { loader } from "~/routes/settings";

import * as userModel from "~/models/user.server";
import * as auth from "~/utils/auth.server";

vi.mock("~/models/user.server");
vi.mock("~/models/score.server");
vi.mock("~/utils/auth.server");

const mockedUser = vi.mocked(userModel, { partial: true });
const mockedAuth = vi.mocked(auth, { partial: true });

const mkArgs = (
  overrides: Partial<LoaderFunctionArgs> = {}
): LoaderFunctionArgs => ({
  request: new Request("http://localhost/settings"),
  params: { username: "alice" },
  context: {},
  ...overrides,
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe("settings loader", () => {
  it("redirects with 302 when user not logged in", async () => {
    const res = await loader(mkArgs());
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/");
  });

  it("returns privacy and achievements for authenticated user", async () => {
    mockedAuth.getUserAuth.mockResolvedValue({
      id: 1,
      username: "alice",
    } as User);
    mockedUser.getUserPrivacy.mockResolvedValue(true);
    mockedUser.getUserAchievements.mockResolvedValue({
      bigRun: "no-display",
    } as UserAchievements);

    const res = await loader(mkArgs());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({
      isPrivate: true,
      achievements: { bigRun: "no-display" },
    });
  });
});
