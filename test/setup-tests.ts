import { vi } from "vitest";
import "@testing-library/jest-dom";

vi.stubEnv("DISCORD_CLIENT_ID", "test-client-id");
vi.stubEnv("DISCORD_CLIENT_SECRET", "test-client-secret");
