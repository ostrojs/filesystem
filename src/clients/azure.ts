const kContainer: unique symbol = Symbol('container');
const kConnection: unique symbol = Symbol('connection');

/**
 * Class AzureClient.
 */
class AzureClient {
    [kContainer]: any;
    [kConnection]: any;

    /**
     * Create a new instance.
     *
     * @param $config - Azure connection configuration.
     */
    constructor($config: Record<string, any>) {
        this[kConnection] = this.getConnection($config['account'], Buffer.from($config['key'], 'base64').toString('ascii'));
        this[kContainer] = this.getContainer($config['container']);
        return this;
    }

    /**
     * getConnection method.
     *
     * @param account - Storage account name.
     * @param key - Storage account key.
     * @returns BlobServiceClient instance or existing connection.
     */
    public getConnection(account?: string, key?: string): any {
        if (account || key) {
            const azureBlob = require('@azure/storage-blob');
            const BlobServiceClient = azureBlob.BlobServiceClient;
            const StorageSharedKeyCredential = azureBlob.StorageSharedKeyCredential;
            return new BlobServiceClient(
                `https://${account}.blob.core.windows.net`,
                new StorageSharedKeyCredential(account!, key!)
            );
        }
        return this[kConnection];
    }

    /**
     * getContainer method.
     *
     * @param container - Container name.
     * @returns ContainerClient instance or default container.
     */
    public getContainer(container?: string): any {
        if (container) {
            return this[kConnection].getContainerClient(container);
        }
        return this[kContainer];
    }
}

export default AzureClient;