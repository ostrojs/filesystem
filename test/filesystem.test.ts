import { describe, test, expect, beforeEach, afterEach, jest } from "@jest/globals";
import Filesystem from "../src/filesystem";
import path from "node:path";
import fsExtra from "fs-extra";
import FileNotFoundException from "../src/fileNotFoundException";

describe("Filesystem Class Unit Tests", () => {
    const tmpDir = path.join(__dirname, "tmp_filesystem_test");
    let fs;

    beforeEach(async () => {
        await fsExtra.ensureDir(tmpDir);
        fs = new Filesystem();
    });

    afterEach(async () => {
        await fsExtra.remove(tmpDir);
    });

    test("exists() and missing() check path existence", async () => {
        const file = path.join(tmpDir, "exist.txt");
        await fsExtra.writeFile(file, "content");
        expect(await fs.exists(file)).toBe(true);
        expect(await fs.missing(file)).toBe(false);

        const missingFile = path.join(tmpDir, "missing.txt");
        expect(await fs.exists(missingFile)).toBe(false);
        expect(await fs.missing(missingFile)).toBe(true);
    });

    test("get() reads content or throws FileNotFoundException", async () => {
        const file = path.join(tmpDir, "read.txt");
        await fsExtra.writeFile(file, "hello world");
        expect(await fs.get(file)).toBe("hello world");

        await expect(fs.get(path.join(tmpDir, "none.txt"))).rejects.toBeInstanceOf(FileNotFoundException);
    });

    test("put() writes file content", async () => {
        const file = path.join(tmpDir, "put.txt");
        await fs.put(file, "data");
        expect(await fsExtra.readFile(file, "utf8")).toBe("data");
    });

    test("replaceInFile() searches and replaces string", async () => {
        const file = path.join(tmpDir, "replace.txt");
        await fsExtra.writeFile(file, "hello foo world");
        fs.replaceInFile("foo", "bar", file);
        await new Promise((r) => setTimeout(r, 50));
        expect(await fsExtra.readFile(file, "utf8")).toBe("hello bar world");
    });

    test("prepend() prepends data to file", async () => {
        const file = path.join(tmpDir, "prepend.txt");
        await fs.put(file, "world");
        await fs.prepend(file, "hello ");
        expect(await fs.get(file)).toContain("hello ");

        const newFile = path.join(tmpDir, "new_prepend.txt");
        await fs.prepend(newFile, "initial");
        expect(await fs.get(newFile)).toBe("initial");
    });

    test("append() appends data to file", async () => {
        const file = path.join(tmpDir, "append.txt");
        await fs.put(file, "start");
        await fs.append(file, "end");
        expect(await fs.get(file)).toBe("startend");
    });

    test("chmod() modifies mode or retrieves stat mode", async () => {
        const file = path.join(tmpDir, "chmod.txt");
        await fs.put(file, "chmod data");
        await fs.chmod(file, 0o755);
        expect(typeof (await fs.chmod(file))).toBe("number");
    });

    test("delete() removes files or list of paths", async () => {
        const f1 = path.join(tmpDir, "d1.txt");
        const f2 = path.join(tmpDir, "d2.txt");
        await fs.put(f1, "1");
        await fs.put(f2, "2");
        expect(await fs.delete([f1, f2])).toBe(true);
        expect(await fs.exists(f1)).toBe(false);

        const f3 = path.join(tmpDir, "d3.txt");
        await fs.put(f3, "3");
        expect(await fs.delete(f3)).toBe(true);
    });

    test("move() and copy() files", async () => {
        const src = path.join(tmpDir, "src.txt");
        const dst = path.join(tmpDir, "dst.txt");
        await fs.put(src, "source");
        await fs.copy(src, dst);
        expect(await fs.get(dst)).toBe("source");

        const moved = path.join(tmpDir, "moved.txt");
        await fs.move(dst, moved);
        expect(await fs.exists(dst)).toBe(false);
        expect(await fs.exists(moved)).toBe(true);
    });

    test("link() and relativeLink() create symlinks", async () => {
        const target = path.join(tmpDir, "target.txt");
        const link = path.join(tmpDir, "link.txt");
        await fs.put(target, "target content");
        await fs.link(target, link);
        expect(await fs.exists(link)).toBe(true);

        const relLink = path.join(tmpDir, "relLink.txt");
        await fs.relativeLink(target, relLink);
        expect(await fs.exists(relLink)).toBe(true);
    });

    test("path inspection helpers: name, basename, dirname, extension, guessExtension", () => {
        const sample = "/var/www/index.html";
        expect(fs.name(sample)).toBe("index");
        expect(fs.basename(sample)).toBe("index.html");
        expect(fs.dirname(sample)).toBe("/var/www");
        expect(fs.extension(sample)).toBe("html");
        expect(fs.guessExtension(sample)).toBe(".html");
    });

    test("type(), mimeType(), size(), lastModified()", async () => {
        const file = path.join(tmpDir, "stat.txt");
        await fs.put(file, "stat data");
        expect(await fs.type(file)).toBe("file");
        expect(await fs.type(tmpDir)).toBe("dir");
        expect(await fs.type("/non/existent/path")).toBe("file");
        expect(fs.mimeType(file)).toBe("txt");
        expect(await fs.size(file)).toBe(9);
        expect(typeof (await fs.lastModified(file))).toBe("number");
    });

    test("isDirectory, isReadable, isWritable, isFile", async () => {
        const file = path.join(tmpDir, "check.txt");
        await fs.put(file, "check");
        expect(await fs.isFile(file)).toBe(true);
        expect(await fs.isDirectory(file)).toBe(false);
        expect(await fs.isDirectory(tmpDir)).toBe(true);
        expect(await fs.isReadable(file)).toBe(true);
        expect(await fs.isWritable(file)).toBe(true);
        expect(await fs.isReadable("/non/existent/path")).toBe(false);
        expect(await fs.isWritable("/non/existent/path")).toBe(false);
    });

    test("glob(), files(), allFiles(), directories()", async () => {
        const sub = path.join(tmpDir, "sub");
        await fs.makeDirectory(sub);
        const f1 = path.join(tmpDir, "f1.txt");
        const f2 = path.join(sub, "f2.txt");
        await fs.put(f1, "1");
        await fs.put(f2, "2");

        const globResult = await fs.glob(path.join(tmpDir, "*.txt"));
        expect(globResult.length).toBeGreaterThanOrEqual(1);

        const globAll = await fs.glob(tmpDir + "/");
        expect(Array.isArray(globAll)).toBe(true);

        const globEmpty = await fs.glob(tmpDir);
        expect(Array.isArray(globEmpty)).toBe(true);

        const globDot = await fs.glob(path.join(tmpDir, "."));
        expect(Array.isArray(globDot)).toBe(true);

        const globEmptyBase = await fs.glob("");
        expect(Array.isArray(globEmptyBase)).toBe(true);

        const filesDepth0 = await fs.files(tmpDir);
        expect(filesDepth0.length).toBeGreaterThanOrEqual(1);

        const all = await fs.allFiles(tmpDir, true);
        expect(all.length).toBeGreaterThanOrEqual(2);

        const dirs = await fs.directories(tmpDir);
        expect(dirs.length).toBeGreaterThanOrEqual(1);
    });

    test("requireOnce() requires file or throws", async () => {
        const jsFile = path.join(tmpDir, "module.js");
        await fs.put(jsFile, "module.exports = { val: 42 };");
        const mod = await fs.requireOnce(jsFile, ["extra"]);
        expect(mod.val).toBe(42);

        await expect(fs.requireOnce(path.join(tmpDir, "none.js"))).rejects.toBeInstanceOf(FileNotFoundException);
    });

    test("ensureDirectoryExists() and makeDirectory()", async () => {
        const dir1 = path.join(tmpDir, "ensure/deep");
        expect(await fs.ensureDirectoryExists(dir1)).toBe(true);
        expect(await fs.isDirectory(dir1)).toBe(true);

        const origEnsureDir = fsExtra.ensureDir;
        (fsExtra as unknown as { ensureDir: unknown }).ensureDir = jest.fn().mockRejectedValue(new Error("fail"));
        expect(await fs.ensureDirectoryExists("/fail")).toBe(false);
        (fsExtra as unknown as { ensureDir: unknown }).ensureDir = origEnsureDir;

        const dir2 = path.join(tmpDir, "mkdir/deep");
        await fs.makeDirectory(dir2, 0o755, true);
        expect(await fs.isDirectory(dir2)).toBe(true);
    });

    test("moveDirectory(), copyDirectory(), deleteDirectory(), deleteDirectories(), cleanDirectory()", async () => {
        const fromDir = path.join(tmpDir, "from");
        const toDir = path.join(tmpDir, "to");
        await fs.makeDirectory(fromDir);
        await fs.put(path.join(fromDir, "hello.txt"), "hello");

        expect(await fs.copyDirectory(fromDir, toDir)).toBe(true);
        expect(await fs.exists(path.join(toDir, "hello.txt"))).toBe(true);

        expect(await fs.copyDirectory("/non/existent/path", toDir)).toBe(false);

        const movedDir = path.join(tmpDir, "movedDir");
        expect(await fs.moveDirectory(fromDir, movedDir)).toBe(true);
        expect(await fs.exists(movedDir)).toBe(true);

        expect(await fs.cleanDirectory(toDir)).toBe(true);
        const remaining = await fs.allFiles(toDir);
        expect(remaining.length).toBe(0);

        const emptyDir = path.join(tmpDir, "empty_dir");
        await fs.makeDirectory(emptyDir);
        expect(await fs.deleteDirectories(emptyDir)).toBe(false);

        await fs.makeDirectory(path.join(tmpDir, "sub_to_delete"));
        expect(await fs.deleteDirectories(tmpDir)).toBe(true);
        expect(await fs.deleteDirectory("/non/existent/dir")).toBe(false);
    });
    test("delete() error catching branch", async () => {
        const fsExtra = require("fs-extra");
        const origRemove = fsExtra.remove;
        fsExtra.remove = jest.fn().mockRejectedValue(new Error("cannot remove"));
        const result = await fs.delete(["/any/path"]);
        expect(result).toBe(false);
        fsExtra.remove = origRemove;
    });

    test("files() and allFiles() with hidden=true", async () => {
        const filesHidden = await fs.files(tmpDir, true);
        expect(Array.isArray(filesHidden)).toBe(true);

        const allFilesHidden = await fs.allFiles(tmpDir, true);
        expect(Array.isArray(allFilesHidden)).toBe(true);
    });

    test("moveDirectory() and copyDirectory() error paths", async () => {
        // moveDirectory overwrite false when destination exists
        const d1 = path.join(tmpDir, "mov1");
        const d2 = path.join(tmpDir, "mov2");
        await fs.makeDirectory(d1);
        await fs.makeDirectory(d2);

        // moveDirectory when rename throws error
        const origRename = require("fs-extra").rename;
        require("fs-extra").rename = jest.fn().mockRejectedValue(new Error("rename fail"));
        expect(await fs.moveDirectory(d1, d2)).toBe(false);
        require("fs-extra").rename = origRename;

        // moveDirectory overwrite=true branch when deleteDirectory fails
        const origDeleteDir = fs.deleteDirectory;
        fs.deleteDirectory = jest.fn().mockResolvedValue(false);
        expect(await fs.moveDirectory(d1, d2, true)).toBe(false);
        fs.deleteDirectory = origDeleteDir;

        // copyDirectory when fs.copy throws error
        const origCopy = require("fs-extra").copy;
        require("fs-extra").copy = jest.fn().mockRejectedValue(new Error("copy fail"));
        expect(await fs.copyDirectory(d1, path.join(tmpDir, "copyFail"))).toBe(false);
        require("fs-extra").copy = origCopy;
    });

    test("glob with empty or dot pattern and local.has with fallback constants", async () => {
        expect(await fs.glob("")).toEqual([]);
        expect(await fs.glob(".")).toEqual([]);
        const res = await fs.glob(path.join(tmpDir, "."));
        expect(Array.isArray(res)).toBe(true);
    });
});
