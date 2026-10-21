import LocalAdapter from "../src/adapter/local";
import path from "path";
import fsExtra from "fs-extra";

describe("LocalAdapter Unit Tests", () => {
    const tmpDir = path.join(__dirname, "tmp_local_adapter");
    let local;

    beforeEach(async () => {
        await fsExtra.ensureDir(tmpDir);
        local = new LocalAdapter(tmpDir, { encoding: "utf-8" });
    });

    afterEach(async () => {
        await fsExtra.remove(tmpDir);
    });

    test("setConfig() and getConfig()", () => {
        expect(local.getConfig()).toEqual({ encoding: "utf-8" });
    });

    test("move() moves files with or without callback", async () => {
        const fileA = path.join(tmpDir, "a.txt");
        const fileB = path.join(tmpDir, "b.txt");
        await fsExtra.writeFile(fileA, "hello");

        await new Promise((resolve) => {
            local.move(fileA, fileB, (err, res, newpath) => {
                expect(Boolean(err)).toBe(false);
                expect(newpath).toBe(fileB);
                resolve();
            });
        });
        expect(await fsExtra.pathExists(fileB)).toBe(true);

        const fileC = path.join(tmpDir, "c.txt");
        await local.move(fileB, fileC);
        expect(await fsExtra.pathExists(fileC)).toBe(true);
    });

    test("write() and read() handle file storage", async () => {
        await new Promise((resolve, reject) => {
            local.write("test.txt", "file content", {}, (err, result, location) => {
                if (err) return reject(err);
                expect(result.message).toBe("File created successfully");
                expect(result.type).toBe("file");
                resolve();
            });
        });

        await new Promise((resolve, reject) => {
            local.read("test.txt", {}, (err, result, location) => {
                if (err) return reject(err);
                expect(result.contents).toBe("file content");
                resolve();
            });
        });
    });

    test("write() into directory generates uuid file", async () => {
        const subDir = path.join(tmpDir, "sub");
        await fsExtra.ensureDir(subDir);

        await new Promise((resolve, reject) => {
            local.write("sub", "uuid content", {}, (err, result, location) => {
                if (err) return reject(err);
                resolve();
            });
        });
        const files = await fsExtra.readdir(subDir);
        expect(files.length).toBe(1);
    });

    test("has() checks file existence", async () => {
        const filePath = path.join(tmpDir, "has.txt");
        await fsExtra.writeFile(filePath, "exists");

        await new Promise((resolve) => {
            local.has("has.txt", { constants: "F_OK" }, (err, exists) => {
                expect(err).toBeNull();
                expect(exists).toBe(true);
                resolve();
            });
        });

        await new Promise((resolve) => {
            local.has("missing.txt", { constants: "F_OK" }, (err, exists) => {
                expect(err).toBeDefined();
                resolve();
            });
        });
    });

    test("createDir() creates subdirectories", async () => {
        await new Promise((resolve, reject) => {
            local.createDir("deep/nested/dir", {}, (err, result, location) => {
                if (err) return reject(err);
                expect(result).toBe(true);
                resolve();
            });
        });
        expect(await fsExtra.pathExists(path.join(tmpDir, "deep/nested/dir"))).toBe(true);
    });

    test("delete() removes files or directories", async () => {
        const file = path.join(tmpDir, "delete.txt");
        await fsExtra.writeFile(file, "content");

        await new Promise((resolve, reject) => {
            local.delete("delete.txt", {}, (err, result, location) => {
                if (err) return reject(err);
                expect(result).toBe(true);
                resolve();
            });
        });
        expect(await fsExtra.pathExists(file)).toBe(false);
    });

    test("global() stub execution", () => {
        expect(typeof local.global).toBe("function");
        local.global();
    });

    test("custom handler execution in Local adapter", async () => {
        const customHandler = {
            delete: jest.fn(({ callback }) => callback(null, true)),
            createDir: jest.fn(({ callback }) => callback(null, true)),
            has: jest.fn(({ callback }) => callback(null, true)),
            write: jest.fn(({ callback }) => callback(null, true)),
            read: jest.fn(({ callback }) => callback(null, true))
        };
        const customLocal = new LocalAdapter(tmpDir, { handler: customHandler });

        await new Promise((r) => customLocal.delete("a", {}, r));
        expect(customHandler.delete).toHaveBeenCalled();

        await new Promise((r) => customLocal.createDir("b", {}, r));
        expect(customHandler.createDir).toHaveBeenCalled();

        await new Promise((r) => customLocal.has("c", { constants: "F_OK" }, r));
        expect(customHandler.has).toHaveBeenCalled();

        await new Promise((r) => customLocal.write("d", "test", {}, r));
        expect(customHandler.write).toHaveBeenCalled();

        await new Promise((r) => customLocal.read("d", {}, r));
        expect(customHandler.read).toHaveBeenCalled();

        class HandlerClass {
            constructor() {
                this.delete = jest.fn();
            }
        }
        const classLocal = new LocalAdapter(tmpDir, { handler: HandlerClass });
        expect(classLocal).toBeDefined();
    });
    test("instantiates LocalAdapter with default root parameter and calls with default options", async () => {
        const defaultLocal = new LocalAdapter(undefined, { encoding: "utf-8" });
        expect(defaultLocal).toBeDefined();

        const file = path.join(tmpDir, "defaults.txt");
        await fsExtra.writeFile(file, "hello defaults");

        await new Promise((resolve) => {
            defaultLocal.has(file, undefined, (err, exists) => {
                expect(exists).toBe(true);
                resolve();
            });
        });

        await new Promise((resolve) => {
            defaultLocal.read(file, undefined, (err, data) => {
                expect(data.contents).toBe("hello defaults");
                resolve();
            });
        });

        await new Promise((resolve) => {
            defaultLocal.delete(file, undefined, (err, res) => {
                expect(res).toBe(true);
                resolve();
            });
        });

        const newDir = path.join(tmpDir, "sub_default");
        await new Promise((resolve) => {
            defaultLocal.createDir(newDir, undefined, (err, res) => {
                expect(res).toBe(true);
                resolve();
            });
        });

        await new Promise((resolve) => {
            defaultLocal.write(path.join(tmpDir, "w_default.txt"), "data", undefined, (err, res) => {
                expect(res.type).toBe("file");
                resolve();
            });
        });
    });
});
