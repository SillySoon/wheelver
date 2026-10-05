import { describe, it, expect } from "vitest";
import { api, createUser, createHotwheel, createCollection, addItems, loginAs } from "./helpers";
import { Collection, CollectionItem } from "../src/models";

describe("collections", () => {
    it("takes the owner from the session, not the request body", async () => {
        const user = await createUser();
        const other = await createUser();
        const headers = await loginAs(user);

        const res = await api().post("/api/collection").set(headers).send({ name: "Mine", owner: other._id });
        expect(res.status).toBe(201);
        expect(String(res.body.owner)).toBe(String(user._id));
    });

    it("only allows renaming on update", async () => {
        const user = await createUser();
        const other = await createUser();
        const collection = await createCollection(user, "Old");
        const headers = await loginAs(user);

        const res = await api()
            .put(`/api/collection/${collection._id}`)
            .set(headers)
            .send({ name: "New", owner: other._id });
        expect(res.status).toBe(200);

        const stored = await Collection.findById(collection._id).lean();
        expect(stored?.name).toBe("New");
        expect(String(stored?.owner)).toBe(String(user._id));
    });

    it("rejects invalid names", async () => {
        const headers = await loginAs(await createUser());
        const res = await api().post("/api/collection").set(headers).send({ name: "<script>" });
        expect(res.status).toBe(400);
    });

    it("forbids editing someone else's collection", async () => {
        const owner = await createUser();
        const collection = await createCollection(owner);
        const headers = await loginAs(await createUser());

        const res = await api().put(`/api/collection/${collection._id}`).set(headers).send({ name: "Hijacked" });
        expect(res.status).toBe(403);
    });

    it("deletes the collection's items with it", async () => {
        const user = await createUser();
        const collection = await createCollection(user);
        await addItems(collection, await createHotwheel(), 2);
        const headers = await loginAs(user);

        const res = await api().delete(`/api/collection/${collection._id}`).set(headers);
        expect(res.status).toBe(200);
        expect(await CollectionItem.countDocuments({ collectionId: collection._id })).toBe(0);
    });
});

describe("collection items", () => {
    it("adds one document per copy", async () => {
        const user = await createUser();
        const collection = await createCollection(user);
        const hotwheel = await createHotwheel();
        const headers = await loginAs(user);

        const res = await api()
            .post(`/api/collection/${collection._id}/items`)
            .set(headers)
            .send({ hotwheel: String(hotwheel._id), quantity: 3 });
        expect(res.status).toBe(201);
        expect(res.body).toHaveLength(3);
        expect(res.body[0].hotwheel.name).toBe(hotwheel.name);

        const items = await CollectionItem.find({ collectionId: collection._id }).lean();
        expect(items).toHaveLength(3);
        expect(new Set(items.map((i) => String(i._id))).size).toBe(3);
        expect(items.every((i) => String(i.owner) === String(user._id))).toBe(true);
    });

    it.each([0, 51, 1.5, "3"])("rejects quantity %s", async (quantity) => {
        const user = await createUser();
        const collection = await createCollection(user);
        const hotwheel = await createHotwheel();
        const headers = await loginAs(user);

        const res = await api()
            .post(`/api/collection/${collection._id}/items`)
            .set(headers)
            .send({ hotwheel: String(hotwheel._id), quantity });
        expect(res.status).toBe(400);
    });

    it("removes exactly one copy", async () => {
        const user = await createUser();
        const collection = await createCollection(user);
        const [first] = await addItems(collection, await createHotwheel(), 3);
        const headers = await loginAs(user);

        const res = await api().delete(`/api/collection/${collection._id}/items/${first._id}`).set(headers);
        expect(res.status).toBe(200);
        expect(await CollectionItem.countDocuments({ collectionId: collection._id })).toBe(2);
    });

    it("does not remove an item through another collection", async () => {
        const user = await createUser();
        const mine = await createCollection(user, "Mine");
        const other = await createCollection(await createUser(), "Other");
        const [foreignItem] = await addItems(other, await createHotwheel(), 1);
        const headers = await loginAs(user);

        const res = await api().delete(`/api/collection/${mine._id}/items/${foreignItem._id}`).set(headers);
        expect(res.status).toBe(404);
        expect(await CollectionItem.exists({ _id: foreignItem._id })).toBeTruthy();
    });

    it("forbids adding to someone else's collection", async () => {
        const collection = await createCollection(await createUser());
        const hotwheel = await createHotwheel();
        const headers = await loginAs(await createUser());

        const res = await api()
            .post(`/api/collection/${collection._id}/items`)
            .set(headers)
            .send({ hotwheel: String(hotwheel._id) });
        expect(res.status).toBe(403);
    });

    it("shows grouped counts on the public collection page", async () => {
        const user = await createUser();
        const collection = await createCollection(user);
        await addItems(collection, await createHotwheel({ name: "Twin Mill" }), 3);

        const res = await api().get(`/c/${collection._id}`);
        expect(res.status).toBe(200);
        expect(res.text).toContain("Twin Mill");
        expect(res.text).toContain("×3");
    });
});
