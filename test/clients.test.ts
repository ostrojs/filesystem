import { describe, test, expect, jest } from "@jest/globals";
const mockS3Constructor = jest.fn();
jest.mock("aws-sdk", () => ({
    S3: mockS3Constructor
}), { virtual: true });

const mockGetContainerClient = jest.fn().mockReturnValue({ name: "mycontainer" });
const mockBlobServiceClient = jest.fn().mockImplementation(() => ({
    getContainerClient: mockGetContainerClient
}));
const mockStorageSharedKeyCredential = jest.fn();

jest.mock("@azure/storage-blob", () => ({
    BlobServiceClient: mockBlobServiceClient,
    StorageSharedKeyCredential: mockStorageSharedKeyCredential
}), { virtual: true });

import S3Client from "../src/clients/s3";
import AzureClient from "../src/clients/azure";

describe("Filesystem Clients Unit Tests", () => {
    describe("S3Client", () => {
        test("instantiates and configures aws S3 client", () => {
            const client = new S3Client({ key: "k", secret: "s", bucket: "b" });
            expect(client.getConnection()).toBeDefined();
            expect(mockS3Constructor).toHaveBeenCalledWith({
                accessKeyId: "k",
                secretAccessKey: "s",
                params: { Bucket: "b" }
            });
        });
    });

    describe("AzureClient", () => {
        test("instantiates and configures azure BlobServiceClient", () => {
            const keyBase64 = Buffer.from("mysecretkey").toString("base64");
            const client = new AzureClient({
                account: "myaccount",
                key: keyBase64,
                container: "mycontainer"
            });

            expect(client.getConnection()).toBeDefined();
            expect(client.getContainer()).toEqual({ name: "mycontainer" });
            expect(client.getContainer("othercontainer")).toEqual({ name: "mycontainer" });
        });
    });
});
