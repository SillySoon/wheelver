import { describe, it, expect } from "vitest";
import type { DiscordProfile } from "discord-strategy";
import { api, createUser, createAdmin, createCollection, createHotwheel, addItems, loginAs } from "./helpers";
import { syncDiscordUser } from "../src/config/passport";
import { User, Collection, CollectionItem } from "../src/models";

const profile = (id: string, username: string, global_name?: string) =>
    ({ id, username, global_name } as DiscordProfile);

describe("public user API", () => {
    it("only exposes public fields", async () => {
        await createUser({ handle: "silly", displayName: "Silly" });

        const res = await api().get("/api/user?search=sil");
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(Object.keys(res.body[0]).sort()).toEqual(["_id", "createdAt", "displayName", "handle"]);
    });
});

describe("profile URLs", () => {
    it("serves profiles by handle, case-insensitively", async () => {
        await createUser({ handle: "silly", displayName: "Silly" });

        const res = await api().get("/u/SILLY");
        expect(res.status).toBe(200);
        expect(res.text).toContain("@silly");
    });

    it("redirects old handles", async () => {
        await createUser({ handle: "newname", previousHandles: ["oldname"] });

        const res = await api().get("/u/oldname");
        expect(res.status).toBe(301);
        expect(res.headers.location).toBe("/u/newname");
    });

    it("redirects legacy ObjectId URLs", async () => {
        const user = await createUser({ handle: "silly" });

        const res = await api().get(`/u/${user._id}`);
        expect(res.status).toBe(301);
        expect(res.headers.location).toBe("/u/silly");
    });

    it("returns 404 for unknown handles", async () => {
        const res = await api().get("/u/nobody");
        expect(res.status).toBe(404);
    });
});

describe("account deletion", () => {
    it("deletes the user with all collections and items", async () => {
        const user = await createUser();
        const collection = await createCollection(user);
        await addItems(collection, await createHotwheel(), 2);
        const headers = await loginAs(user);

        const res = await api().delete(`/api/user/${user._id}`).set(headers);
        expect(res.status).toBe(200);
        expect(await User.exists({ _id: user._id })).toBeNull();
        expect(await Collection.countDocuments({ owner: user._id })).toBe(0);
        expect(await CollectionItem.countDocuments({ owner: user._id })).toBe(0);
    });

    it("forbids deleting other users", async () => {
        const victim = await createUser();
        const headers = await loginAs(await createUser());

        const res = await api().delete(`/api/user/${victim._id}`).set(headers);
        expect(res.status).toBe(403);
        expect(await User.exists({ _id: victim._id })).toBeTruthy();
    });

    it("allows admins to delete users", async () => {
        const victim = await createUser();
        const headers = await loginAs(await createAdmin());

        const res = await api().delete(`/api/user/${victim._id}`).set(headers);
        expect(res.status).toBe(200);
    });
});

describe("Discord sync on login", () => {
    it("creates new users from the Discord profile", async () => {
        const user = await syncDiscordUser(profile("111", "Silly", "Silly Soon"));
        expect(user.handle).toBe("silly");
        expect(user.displayName).toBe("Silly Soon");
    });

    it("falls back to the username as display name", async () => {
        const user = await syncDiscordUser(profile("111", "silly"));
        expect(user.displayName).toBe("silly");
    });

    it("keeps the old handle when it changes", async () => {
        await syncDiscordUser(profile("111", "oldname"));
        const user = await syncDiscordUser(profile("111", "newname"));

        expect(user.handle).toBe("newname");
        expect(user.previousHandles).toEqual(["oldname"]);
    });

    it("parks a stale holder of the handle on their Discord ID", async () => {
        await syncDiscordUser(profile("111", "silly"));
        // User 111 renamed on Discord; user 222 now owns "silly"
        const newOwner = await syncDiscordUser(profile("222", "silly"));

        const stale = await User.findOne({ discordId: "111" }).lean();
        expect(newOwner.handle).toBe("silly");
        expect(stale?.handle).toBe("111");
    });
});
