import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import FilesystemAdapter from "../src/filesystemAdapter";
import FileNotFoundException from "../src/fileNotFoundException";
import FileDeleteException from "../src/fileDeleteException";
import FileUploadException from "../src/fileUploadException";
import DirectoryCreateException from "../src/directoryCreateException";

describe("FilesystemAdapter Unit Tests", () => {
    let mockAdapter;
    let mockHandler;
    let adapter;

    beforeEach(() => {
        mockAdapter = {
            has: jest.fn(),
            read: jest.fn(),
            write: jest.fn(),
            delete: jest.fn(),
            createDir: jest.fn(),
            getAdapter: jest.fn()
        };
        mockHandler = {
            exists: jest.fn((err, data, resolve) => resolve(data)),
            get: jest.fn((err, data, resolve, path, opt, base) => err ? resolve(err) : resolve(data)),
            delete: jest.fn((err, data, resolve, path, opt, base) => err ? resolve(err) : resolve(data)),
            put: jest.fn((err, data, resolve, path, opt, base) => err ? resolve(err) : resolve(data)),
            createDir: jest.fn((err, data, resolve, path, opt, base) => err ? resolve(err) : resolve(data))
        };
        adapter = new FilesystemAdapter(mockAdapter, mockHandler);
    });

    test("exists() checks file existence through adapter and handler", async () => {
        mockAdapter.has.mockImplementation((path, opt, cb) => cb(null, true, "/root"));
        let res = await adapter.exists("file.txt");
        expect(res).toBe(true);

        mockAdapter.has.mockImplementation((path, opt, cb) => cb(new Error("missing"), false, "/root"));
        res = await adapter.exists("file.txt");
        expect(res).toBe(false);
    });

    test("path() calls inner adapter path prefix", () => {
        mockAdapter.applyPathPrefix = jest.fn().mockReturnValue("/applied/file.txt");
        expect(adapter.path("file.txt")).toBe("/applied/file.txt");

        delete mockAdapter.applyPathPrefix;
        mockAdapter.getAdapter.mockReturnValue({
            getPathPrefix: () => ({ "file.txt": "/absolute/file.txt" })
        });
        expect(adapter.path("file.txt")).toBe("/absolute/file.txt");
    });

    test("get() resolves file content or rejects with FileNotFoundException", async () => {
        mockAdapter.read.mockImplementation((path, opt, cb) => cb(null, "content", "/root"));
        let res = await adapter.get("file.txt");
        expect(res).toBe("content");

        mockAdapter.read.mockImplementation((path, opt, cb) => cb(null, () => "funcContent", "/root"));
        res = await adapter.get("file.txt");
        expect(res).toBe("funcContent");

        mockAdapter.read.mockImplementation((path, opt, cb) => cb(new Error("not found"), null, "/root"));
        mockHandler.get.mockImplementation((err, data, reject) => reject(err));
        await expect(adapter.get("missing.txt")).rejects.toBeInstanceOf(FileNotFoundException);
    });

    test("delete() with callback calls adapter.delete directly", () => {
        const cb = jest.fn();
        adapter.delete("file.txt", cb);
        expect(mockAdapter.delete).toHaveBeenCalledWith("file.txt", {}, cb);
    });

    test("delete() with promise resolves data or rejects with FileDeleteException", async () => {
        mockAdapter.delete.mockImplementation((path, opt, cb) => cb(null, true, "/root"));
        let res = await adapter.delete("file.txt");
        expect(res).toBe(true);

        mockAdapter.delete.mockImplementation((path, opt, cb) => cb(null, () => "deleted", "/root"));
        res = await adapter.delete("file.txt");
        expect(res).toBe("deleted");

        mockAdapter.delete.mockImplementation((path, opt, cb) => cb(new Error("fail"), null, "/root"));
        mockHandler.delete.mockImplementation((err, data, reject) => reject(err));
        await expect(adapter.delete("file.txt")).rejects.toBeInstanceOf(FileDeleteException);
    });

    test("makeDirectory() resolves or rejects with DirectoryCreateException", async () => {
        mockAdapter.createDir.mockImplementation((path, opt, cb) => cb(null, true, "/root"));
        let res = await adapter.makeDirectory("sub");
        expect(res).toBe(true);

        mockAdapter.createDir.mockImplementation((path, opt, cb) => cb(null, () => "created", "/root"));
        res = await adapter.makeDirectory("sub");
        expect(res).toBe("created");

        mockAdapter.createDir.mockImplementation((path, opt, cb) => cb(new Error("fail"), null, "/root"));
        mockHandler.createDir.mockImplementation((err, data, reject) => reject(err));
        await expect(adapter.makeDirectory("sub")).rejects.toBeInstanceOf(DirectoryCreateException);
    });

    test("put() writes content or rejects with FileUploadException", async () => {
        mockAdapter.write.mockImplementation((path, content, opt, cb) => cb(null, "written", "/root"));
        let res = await adapter.put("file.txt", "data");
        expect(res).toBe("written");

        mockAdapter.write.mockImplementation((path, content, opt, cb) => cb(null, () => "dataFn", "/root"));
        res = await adapter.put("file.txt", "data");
        expect(res).toBe("dataFn");

        mockAdapter.write.mockImplementation((path, content, opt, cb) => cb(new Error("write fail"), null, "/root"));
        mockHandler.delete.mockImplementation((err, data, reject) => reject(err));
        await expect(adapter.put("file.txt", "data")).rejects.toBeInstanceOf(FileUploadException);
    });

    test("putFile() and putFileAs() handle file uploads", async () => {
        mockAdapter.write.mockImplementation((path, content, opt, cb) => cb(null, { path, content }, "/root"));
        const mockFile = {
            getHashname: () => "hash123.png",
            getBufferData: () => Buffer.from("imgdata")
        };
        const res1 = await adapter.putFile("uploads", mockFile);
        expect(res1.path).toBe("uploads/hash123.png");

        const res2 = await adapter.putFileAs("uploads", mockFile, "custom.png");
        expect(res2.path).toBe("uploads/custom.png");
    });

    test("getAdapter() returns underlying adapter instance", () => {
        expect(adapter.getAdapter()).toBe(mockAdapter);
    });
});
