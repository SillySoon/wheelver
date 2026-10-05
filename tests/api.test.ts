import { describe, it, expect } from "vitest";
import { api, createAdmin, createUser, createHotwheel, createCollection, addItems, loginAs } from "./helpers";
import { Hotwheel, Series } from "../src/models";

describe("error handling", () => {
    it("answers unknown API routes with JSON 404", async () => {
        const res = await api().get("/api/does-not-exist");
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: "Not found" });
    });

    it("renders an error page for unknown pages", async () => {
        const res = await api().get("/does-not-exist").set("Accept", "text/html");
        expect(res.status).toBe(404);
        expect(res.text).toContain("404 - Page Not Found");
    });

    it("rejects malformed ObjectIds with 400", async () => {
        const res = await api().get("/api/hotwheel/not-an-id");
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid ID format");
    });

    it("rejects malformed JSON bodies with 400", async () => {
        const headers = await loginAs(await createUser());
        const res = await api()
            .post("/api/collection")
            .set(headers)
            .set("Content-Type", "application/json")
            .send("{ not json");
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Malformed request body");
    });

    it("returns validation details", async () => {
        const headers = await loginAs(await createAdmin());
        const res = await api().post("/api/series").set(headers).send({ name: "" });
        expect(res.status).toBe(400);
        expect(res.body.details.map((d: { path: string }) => d.path)).toEqual(["name", "shortName"]);
    });

    it("never leaks internal error messages", async () => {
        const res = await api().get("/api/collection?page=0");
        expect(res.status).toBe(400);
        expect(JSON.stringify(res.body)).not.toMatch(/mongo|stack|at /i);
    });
});

describe("catalog validation (admin)", () => {
    it("strips unknown fields", async () => {
        const headers = await loginAs(await createAdmin());
        const res = await api()
            .post("/api/series")
            .set(headers)
            .send({ name: "Mainline", shortName: "ML", _id: "x", isAdmin: true });
        expect(res.status).toBe(201);

        const stored = await Series.findOne({ name: "Mainline" }).lean();
        expect(stored).not.toHaveProperty("isAdmin");
    });

    it("validates hotwheel fields", async () => {
        const headers = await loginAs(await createAdmin());
        const series = await Series.create({ name: "Mainline", shortName: "ML" });
        const res = await api()
            .post("/api/hotwheel")
            .set(headers)
            .send({ toyNumber: "ABC12", name: "Twin Mill", series: String(series._id), seriesNumber: 1, year: 1900 });
        expect(res.status).toBe(400);
        expect(res.body.details[0].path).toBe("year");
    });

    it("refuses to delete a hotwheel that is still collected", async () => {
        const headers = await loginAs(await createAdmin());
        const hotwheel = await createHotwheel();
        await addItems(await createCollection(await createUser()), hotwheel, 1);

        const res = await api().delete(`/api/hotwheel/${hotwheel._id}`).set(headers);
        expect(res.status).toBe(409);
        expect(await Hotwheel.exists({ _id: hotwheel._id })).toBeTruthy();
    });

    it("refuses to delete a series that still has hotwheels", async () => {
        const headers = await loginAs(await createAdmin());
        const hotwheel = await createHotwheel();

        const res = await api().delete(`/api/series/${hotwheel.series}`).set(headers);
        expect(res.status).toBe(409);
    });
});

describe("pagination", () => {
    it("pages the hotwheel catalog", async () => {
        for (let i = 0; i < 5; i++) await createHotwheel();

        const res = await api().get("/api/hotwheel?page=2&limit=2");
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.pagination).toEqual({ page: 2, limit: 2, total: 5, totalPages: 3 });
    });

    it("caps the page size", async () => {
        const res = await api().get("/api/hotwheel?limit=1000");
        expect(res.status).toBe(400);
    });

    it("searches the catalog", async () => {
        await createHotwheel({ name: "Mazda MX-5" });
        await createHotwheel({ name: "Twin Mill" });

        const res = await api().get("/api/hotwheel?search=mazda mx5");
        expect(res.body.data.map((h: { name: string }) => h.name)).toEqual(["Mazda MX-5"]);
    });

    it("pages collection items", async () => {
        const collection = await createCollection(await createUser());
        await addItems(collection, await createHotwheel(), 3);

        const res = await api().get(`/api/collection/${collection._id}/items?limit=2`);
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.pagination.total).toBe(3);
    });
});

describe("health check", () => {
    it("reports ok when the database is connected", async () => {
        const res = await api().get("/healthz");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: "ok" });
    });
});
