const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const kContainer = Symbol('container')
const kConnection = Symbol('connection')
class AzureClient {
    constructor($config) {
        this[kConnection] = this.getConnection($config['account'], Buffer.from($config['key'], 'base64').toString('ascii'));
        this[kContainer] = this.getContainer($config['container']);
        return this
    }
    getConnection(account, key) {
        if (account || key) {
            return new BlobServiceClient(
                `https://${account}.blob.core.windows.net`,
                new StorageSharedKeyCredential(account, key)
            );
        }
        return this[kConnection]
    }
    getContainer(container) {
        if (container) {
            return this[kConnection].getContainerClient(container)
        }
        return this[kContainer]
    }

}
module.exports = AzureClient