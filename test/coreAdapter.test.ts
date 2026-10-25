import { describe, test, expect, beforeEach } from "@jest/globals";
import CoreAdapter from "../src/adapter/CoreAdapter";
import path from "node:path";

describe("CoreAdapter Unit Tests", () => {
    let adapter;

    beforeEach(() => {
        adapter = new CoreAdapter();
    });

    test("setConfig() and getConfig()", () => {
        expect(adapter.getConfig()).toBeNull();
        adapter.setConfig({ opt: 1 });
        expect(adapter.getConfig()).toEqual({ opt: 1 });
    });

    test("setPathPrefix() and applyPathPrefix()", () => {
        adapter.setPathPrefix("/base/root");
        expect(adapter.applyPathPrefix("file.txt")).toBe(path.resolve("/base/root/file.txt"));
    });

    test("setUrlPrefix() and applyUrlPrefix()", () => {
        adapter.setUrlPrefix("https://example.com/storage");
        expect(adapter.applyUrlPrefix("file.png")).toContain("https://example.com/storage/file.png");
    });

    test("ensureDirectory(), parsePath(), dirname()", (done) => {
        adapter.ensureDirectory(__dirname, (err) => {
            expect(err).toBeNull();
            expect(adapter.parsePath("/a/b/c.txt").base).toBe("c.txt");
            expect(adapter.dirname("/a/b/c.txt")).toBe("/a/b");
            done();
        });
    });

    test("getContent() and getBufferData()", () => {
        const buf = Buffer.from("data");
        expect(adapter.getContent(["first", "second"])).toBe("first");
        expect(adapter.getContent("plain")).toBe("plain");
        expect(adapter.getBufferData({ buffer: buf })).toBe(buf);
    });

    test("default stubs: move, delete, has, write, read", (done) => {
        adapter.move("a", "b", (err) => {
            expect(err.status).toBe(500);
            adapter.delete("a", {}, (err) => {
                expect(err.status).toBe(500);
                adapter.has("a", {}, (err) => {
                    expect(err.status).toBe(500);
                    adapter.write("a", "content", {}, (err) => {
                        expect(err.status).toBe(500);
                        adapter.read("a", {}, (err) => {
                            expect(err.status).toBe(500);
                            done();
                        });
                    });
                });
            });
        });
    });
    test("write() and other stubs with various arguments", (done) => {
        adapter.write("a", "b", (err) => {
            expect(err.status).toBe(500);
            adapter.write("a", "b"); // no callback branch
            done();
        });
    });
    test("delete, has, read with default options={}", (done) => {
        adapter.delete("a", undefined, (err1) => {
            expect(err1.status).toBe(500);
            adapter.has("a", undefined, (err2) => {
                expect(err2.status).toBe(500);
                adapter.read("a", undefined, (err3) => {
                    expect(err3.status).toBe(500);
                    done();
                });
            });
        });
    });

});
