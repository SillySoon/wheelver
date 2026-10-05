// Starts one in-memory MongoDB for the whole test run
import { MongoMemoryServer } from "mongodb-memory-server-core";
import type { TestProject } from "vitest/node";

declare module "vitest" {
    export interface ProvidedContext {
        mongoUri: string;
    }
}

export default async function setup(project: TestProject) {
    const mongo = await MongoMemoryServer.create();
    project.provide("mongoUri", mongo.getUri("wheelver-test"));

    return async () => {
        await mongo.stop();
    };
}
