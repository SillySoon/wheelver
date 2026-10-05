import { describe, it, expect } from "vitest";
import { api, createUser, createAdmin, loginAs, CSRF_TOKEN } from "./helpers";
import { Series } from "../src/models";

describe("admin-only catalog routes", () => {
    const series = { name: "Mainline", shortName: "ML" };

    it("rejects anonymous writes with 401", async () => {
        const res = await api().post("/api/series").send(series);
        expect(res.status).toBe(401);
    });

    it("rejects regular users with 403", async () => {
        const headers = await loginAs(await createUser());
        const res = await api().post("/api/series").set(headers).send(series);
        expect(res.status).toBe(403);
        expect(await Series.countDocuments()).toBe(0);
    });

    it("allows admins", async () => {
        const headers = await loginAs(await createAdmin());
        const res = await api().post("/api/series").set(headers).send(series);
        expect(res.status).toBe(201);
    });

    it("keeps catalog reads public", async () => {
        const res = await api().get("/api/series");
        expect(res.status).toBe(200);
    });
});

describe("CSRF protection", () => {
    it("rejects authenticated writes without a token", async () => {
        const { Cookie } = await loginAs(await createUser());
        const res = await api().post("/api/collection").set("Cookie", Cookie).send({ name: "Test" });
        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/CSRF/);
    });

    it("rejects authenticated writes with a wrong token", async () => {
        const { Cookie } = await loginAs(await createUser());
        const res = await api()
            .post("/api/collection")
            .set("Cookie", Cookie)
            .set("X-CSRF-Token", "x".repeat(CSRF_TOKEN.length))
            .send({ name: "Test" });
        expect(res.status).toBe(403);
    });

    it("accepts the token from a form field", async () => {
        const { Cookie } = await loginAs(await createUser());
        const res = await api().post("/api/collection").set("Cookie", Cookie).send({ name: "Test", _csrf: CSRF_TOKEN });
        expect(res.status).toBe(201);
    });
});

describe("logout", () => {
    it("is not available via GET", async () => {
        const res = await api().get("/auth/logout");
        expect(res.status).toBe(404);
    });

    it("ends the session via POST", async () => {
        const headers = await loginAs(await createUser());
        const logout = await api().post("/auth/logout").set(headers);
        expect(logout.status).toBe(302);

        const me = await api().get("/api/user/me").set(headers);
        expect(me.status).toBe(401);
    });
});
