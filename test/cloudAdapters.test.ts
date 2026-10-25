import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import S3Adapter from "../src/adapter/s3";
import AzureAdapter from "../src/adapter/azure";

describe("Cloud Adapters (S3 and Azure) Unit Tests", () => {
    describe("S3Adapter", () => {
        let mockS3Conn;
        let mockS3Client;
        let s3Adapter;

        beforeEach(() => {
            mockS3Conn = {
                getObject: jest.fn().mockReturnValue({
                    promise: jest.fn()
                }),
                upload: jest.fn().mockReturnValue({
                    promise: jest.fn()
                })
            };
            mockS3Client = {
                url: "https://mybucket.s3.amazonaws.com",
                getConnection: () => mockS3Conn
            };
            s3Adapter = new S3Adapter(mockS3Client, {});
        });

        test("read() retrieves object content or handles error", async () => {
            mockS3Conn.getObject().promise.mockResolvedValue({
                Body: Buffer.from("hello s3")
            });

            await new Promise((resolve) => {
                s3Adapter.read("/file.txt", {}, (err, dataFn, basePath) => {
                    expect(err).toBeNull();
                    expect(dataFn().contents).toBe("hello s3");
                    expect(dataFn().type).toBe("file");
                    resolve();
                });
            });

            mockS3Conn.getObject().promise.mockResolvedValue({
                Body: Buffer.from("base64data")
            });

            await new Promise((resolve) => {
                s3Adapter.read("file.txt", { dataType: "base64" }, (err, dataFn, basePath) => {
                    expect(dataFn().contents).toBe(Buffer.from("base64data").toString("base64"));
                    resolve();
                });
            });

            mockS3Conn.getObject().promise.mockRejectedValue(new Error("s3 fail"));
            await new Promise((resolve) => {
                s3Adapter.read("err.txt", {}, (err, dataFn, basePath) => {
                    expect(err).toBeDefined();
                    resolve();
                });
            });
        });

        test("write() uploads object or handles error", async () => {
            mockS3Conn.upload().promise.mockResolvedValue({ Location: "s3://url" });

            await new Promise((resolve) => {
                s3Adapter.write("/upload.txt", Buffer.from("upload data"), {}, (err, dataFn, basePath) => {
                    expect(err).toBeNull();
                    expect(dataFn().message).toBe("File uploaded successfully");
                    resolve();
                });
            });

            mockS3Conn.upload().promise.mockRejectedValue(new Error("upload err"));
            await new Promise((resolve) => {
                s3Adapter.write("upload_err.txt", Buffer.from("data"), {}, (err, dataFn, basePath) => {
                    expect(err).toBeDefined();
                    resolve();
                });
            });
        });
        test("s3Adapter with default options={} and default handler", async () => {
            const client = { url: "https://url", getConnection: () => mockS3Conn };
            const s3Default = new S3Adapter(client, {});
            mockS3Conn.getObject().promise.mockResolvedValue({ Body: Buffer.from("s3 def") });
            mockS3Conn.upload().promise.mockResolvedValue({});

            await new Promise((resolve) => {
                s3Default.read("s3.txt", undefined, (err, dataFn) => {
                    expect(dataFn().contents).toBe("s3 def");
                    resolve();
                });
            });

            await new Promise((resolve) => {
                s3Default.write("s3.txt", Buffer.from("data"), undefined, (err, dataFn) => {
                    expect(dataFn().message).toBe("File uploaded successfully");
                    resolve();
                });
            });

            const s3ClassHandler = new S3Adapter(client, { handler: class H {} });
            expect(s3ClassHandler).toBeDefined();
            const s3ObjHandler = new S3Adapter(client, { handler: {} });
            expect(s3ObjHandler).toBeDefined();
        });


        test("s3Adapter with custom handler", async () => {
            const customHandler = {
                read: jest.fn(({ callback }) => callback(null)),
                write: jest.fn(({ callback }) => callback(null))
            };
            const customS3 = new S3Adapter(mockS3Client, { handler: customHandler });
            mockS3Conn.getObject().promise.mockResolvedValue({ Body: Buffer.from("custom") });
            mockS3Conn.upload().promise.mockResolvedValue({});

            await new Promise((r) => customS3.read("a.txt", {}, r));
            expect(customHandler.read).toHaveBeenCalled();

            await new Promise((r) => customS3.write("b.txt", Buffer.from("data"), {}, r));
            expect(customHandler.write).toHaveBeenCalled();
        });
    });

    describe("AzureAdapter", () => {
        let mockBlobClient;
        let mockAzureContainer;
        let mockAzureClient;
        let azureAdapter;

        beforeEach(() => {
            mockBlobClient = {
                downloadToBuffer: jest.fn(),
                upload: jest.fn()
            };
            mockAzureContainer = {
                getBlockBlobClient: jest.fn().mockReturnValue(mockBlobClient)
            };
            mockAzureClient = {
                url: "https://account.blob.core.windows.net",
                getContainer: jest.fn().mockReturnValue(mockAzureContainer)
            };
            azureAdapter = new AzureAdapter(mockAzureClient, {});
        });

        test("read() downloads buffer or handles error", async () => {
            mockBlobClient.downloadToBuffer.mockResolvedValue(Buffer.from("azure content"));

            await new Promise((resolve) => {
                azureAdapter.read("azure.txt", {}, (err, dataFn, basePath) => {
                    expect(err).toBeNull();
                    expect(dataFn().contents).toBe("azure content");
                    resolve();
                });
            });

            await new Promise((resolve) => {
                azureAdapter.read("azure.txt", { dataType: "base64" }, (err, dataFn, basePath) => {
                    expect(dataFn().contents).toBe(Buffer.from("azure content").toString("base64"));
                    resolve();
                });
            });

            mockBlobClient.downloadToBuffer.mockRejectedValue(new Error("azure fail"));
            await new Promise((resolve) => {
                azureAdapter.read("missing.txt", {}, (err, dataFn, basePath) => {
                    expect(err).toBeDefined();
                    resolve();
                });
            });
        });

        test("write() uploads blob or handles error", async () => {
            mockBlobClient.upload.mockResolvedValue({ etag: "123" });

            await new Promise((resolve) => {
                azureAdapter.write("azure.txt", Buffer.from("content"), {}, (err, dataFn, basePath) => {
                    expect(err).toBeNull();
                    expect(dataFn().message).toBe("File uploaded successfully");
                    resolve();
                });
            });

            mockBlobClient.upload.mockRejectedValue(new Error("azure upload err"));
            await new Promise((resolve) => {
                azureAdapter.write("azure.txt", Buffer.from("content"), {}, (err, dataFn, basePath) => {
                    expect(err).toBeDefined();
                    resolve();
                });
            });
        });

        test("azureAdapter with custom handler", async () => {
            const customHandler = {
                read: jest.fn(({ callback }) => callback(null)),
                write: jest.fn(({ callback }) => callback(null))
            };
            const customAzure = new AzureAdapter(mockAzureClient, { handler: customHandler });
            mockBlobClient.downloadToBuffer.mockResolvedValue(Buffer.from("custom"));
            mockBlobClient.upload.mockResolvedValue({});

            await new Promise((r) => customAzure.read("a.txt", {}, r));
            expect(customHandler.read).toHaveBeenCalled();

            await new Promise((r) => customAzure.write("b.txt", Buffer.from("data"), {}, r));
            expect(customHandler.write).toHaveBeenCalled();
        });
        test("azureAdapter with default config and default handler fallback", () => {
            const client = { url: "https://url", getContainer: () => ({ getBlockBlobClient: () => ({}) }) };
            const az1 = new AzureAdapter(client, { handler: class H {} });
            expect(az1).toBeDefined();

            const az2 = new AzureAdapter(client, { handler: {} });
            expect(az2).toBeDefined();

            const az3 = new AzureAdapter(client, {});
            expect(az3).toBeDefined();
        });

        test("azureAdapter with default options={}", async () => {
            mockBlobClient.upload.mockResolvedValue({ etag: "123" });
            mockBlobClient.downloadToBuffer.mockResolvedValue(Buffer.from("azure def"));

            await new Promise((resolve) => {
                azureAdapter.read("azure.txt", undefined, (err, dataFn) => {
                    expect(dataFn().contents).toBe("azure def");
                    resolve();
                });
            });

            await new Promise((resolve) => {
                azureAdapter.write("azure.txt", Buffer.from("content"), undefined, (err, dataFn) => {
                    expect(dataFn().message).toBe("File uploaded successfully");
                    resolve();
                });
            });
        });
    });
});
