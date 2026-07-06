import { useAuthStore } from "../auth.store";

const mockUser = {
  id: "1",
  email: "user@example.com",
  name: "User",
  isEmailVerified: true,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

beforeEach(() => {
  useAuthStore.setState({ accessToken: null, user: null });
});

describe("useAuthStore", () => {
  it("initial state is null", () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it("setSession stores token and user", () => {
    useAuthStore.getState().setSession("tok123", mockUser);
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("tok123");
    expect(state.user).toEqual(mockUser);
  });

  it("setAccessToken updates only the token", () => {
    useAuthStore.getState().setSession("old-tok", mockUser);
    useAuthStore.getState().setAccessToken("new-tok");
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("new-tok");
    expect(state.user).toEqual(mockUser);
  });

  it("logout clears both token and user", () => {
    useAuthStore.getState().setSession("tok", mockUser);
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it("setSession with null user stores null user", () => {
    useAuthStore.getState().setSession("tok", null);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
