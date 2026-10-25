import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import FilesystemHandler from "../src/callbackHandler";

describe("FilesystemHandler Unit Tests", () => {
    let handler: FilesystemHandler;

    beforeEach(() => {
        handler = new FilesystemHandler();
    });

    test("exists() passes error or data to callback", () => {
        const cbErr = jest.fn();
        handler.exists(new Error("err"), null, cbErr);
        expect(cbErr).toHaveBeenCalledWith(expect.any(Error));

        const cbData = jest.fn();
        handler.exists(null, true, cbData);
        expect(cbData).toHaveBeenCalledWith(true);
    });

    test("get() passes error or data to callback", () => {
        const cbErr = jest.fn();
        handler.get(new Error("err"), null, cbErr);
        expect(cbErr).toHaveBeenCalledWith(expect.any(Error));

        const cbData = jest.fn();
        handler.get(null, "content", cbData);
        expect(cbData).toHaveBeenCalledWith("content");
    });

    test("delete() passes error or data to callback", () => {
        const cbErr = jest.fn();
        handler.delete(new Error("err"), null, cbErr);
        expect(cbErr).toHaveBeenCalledWith(expect.any(Error));

        const cbData = jest.fn();
        handler.delete(null, true, cbData);
        expect(cbData).toHaveBeenCalledWith(true);
    });

    test("put() passes error or data to callback", () => {
        const cbErr = jest.fn();
        handler.put(new Error("err"), null, cbErr);
        expect(cbErr).toHaveBeenCalledWith(expect.any(Error));

        const cbData = jest.fn();
        handler.put(null, "ok", cbData);
        expect(cbData).toHaveBeenCalledWith("ok");
    });

    test("global() passes error or data to callback", () => {
        const cbErr = jest.fn();
        handler.global(new Error("err"), null, cbErr);
        expect(cbErr).toHaveBeenCalledWith(expect.any(Error));

        const cbData = jest.fn();
        handler.global(null, "globalData", cbData);
        expect(cbData).toHaveBeenCalledWith("globalData");
    });

    test("createDir() passes error or true to callback", () => {
        const cbErr = jest.fn();
        handler.createDir(new Error("err"), null, cbErr);
        expect(cbErr).toHaveBeenCalledWith(expect.any(Error));

        const cbData = jest.fn();
        handler.createDir(null, null, cbData);
        expect(cbData).toHaveBeenCalledWith(true);
    });
});
