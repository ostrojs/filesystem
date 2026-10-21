import FileNotFoundException from "../src/fileNotFoundException";
import FileDeleteException from "../src/fileDeleteException";
import FileUploadException from "../src/fileUploadException";
import DirectoryCreateException from "../src/directoryCreateException";
import InvalidArgumentException from "../src/invalidArgumentException";

describe("Filesystem Exceptions Unit Tests", () => {
    test("FileNotFoundException has correct properties and status", () => {
        const err = new FileNotFoundException("file err");
        expect(err.name).toBe("FileNotFoundException");
        expect(err.statusCode).toBe(404);
        expect(err.errors).toBe("file err");
        expect(err.message).toBe("Specefied file is not found");
    });

    test("FileDeleteException has correct properties and status", () => {
        const err = new FileDeleteException("del err", "/path/file");
        expect(err.name).toBe("FileNotFoundException");
        expect(err.statusCode).toBe(500);
        expect(err.errors).toBe("del err");
        expect(err.message).toBe("Unable to delete ");
    });

    test("FileUploadException has correct properties and status", () => {
        const err = new FileUploadException("upload err");
        expect(err.name).toBe("FileUploadException");
        expect(err.statusCode).toBe(500);
        expect(err.errors).toBe("upload err");
        expect(err.message).toBe("Error in upload file");
    });

    test("DirectoryCreateException has correct properties and status", () => {
        const err = new DirectoryCreateException("dir err");
        expect(err.name).toBe("DirectoryCreateException");
        expect(err.statusCode).toBe(404);
        expect(err.errors).toBe("dir err");
        expect(err.message).toBe("Unable to create directory");
    });

    test("InvalidArgumentException has correct properties and status", () => {
        const err = new InvalidArgumentException("invalid arg");
        expect(err.name).toBe("InvalidArgumentException");
        expect(err.statusCode).toBe(500);
        expect(err.message).toBe("invalid arg");
    });
});
