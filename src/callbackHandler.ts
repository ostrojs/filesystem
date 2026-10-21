/**
 * Class FilesystemHandler.
 */
class FilesystemHandler {
    /**
     * exists method.
     *
     * @param error - Potential error.
     * @param data - Existence check result.
     * @param callback - Resolution callback.
     * @param path - File path.
     * @param options - Options object.
     * @param basePath - Base path.
     */
    exists(error: unknown, data: Record<string, any> | boolean | null, callback: (res: any) => void, path?: string, options?: Record<string, any>, basePath?: any): void {
        if (error) {
            callback(error);
        } else {
            callback(data);
        }
    }

    /**
     * get method.
     *
     * @param error - Potential error.
     * @param data - Retrieved data.
     * @param callback - Resolution callback.
     * @param path - File path.
     * @param options - Options object.
     * @param basePath - Base path.
     */
    get(error: unknown, data: any, callback: (res: any) => void, path?: string, options?: Record<string, any>, basePath?: any): void {
        if (error) {
            callback(error);
        } else {
            callback(data);
        }
    }

    /**
     * delete method.
     *
     * @param error - Potential error.
     * @param data - Deletion result.
     * @param callback - Resolution callback.
     * @param path - File path.
     * @param options - Options object.
     * @param basePath - Base path.
     */
    delete(error: unknown, data: any, callback: (res: any) => void, path?: string, options?: Record<string, any>, basePath?: any): void {
        if (error) {
            callback(error);
        } else {
            callback(data);
        }
    }

    /**
     * put method.
     *
     * @param error - Potential error.
     * @param data - Write result.
     * @param callback - Resolution callback.
     * @param path - File path.
     * @param options - Options object.
     * @param basePath - Base path.
     */
    put(error: unknown, data: any, callback: (res: any) => void, path?: string, options?: Record<string, any>, basePath?: any): void {
        if (error) {
            callback(error);
        } else {
            callback(data);
        }
    }

    /**
     * global method.
     *
     * @param error - Potential error.
     * @param data - Global data.
     * @param callback - Resolution callback.
     * @param path - File path.
     * @param options - Options object.
     */
    global(error: unknown, data: any, callback: (res: any) => void, path?: string, options?: Record<string, any>): void {
        if (error) {
            callback(error);
        } else {
            callback(data);
        }
    }

    /**
     * createDir method.
     *
     * @param error - Potential error.
     * @param data - Creation result.
     * @param callback - Resolution callback.
     */
    createDir(error: unknown, data: any, callback: (res: any) => void): void {
        if (error) {
            callback(error);
        } else {
            callback(true);
        }
    }
}

export default FilesystemHandler;