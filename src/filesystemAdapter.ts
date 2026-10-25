import path from 'node:path';
import FileNotFoundException from './fileNotFoundException';
import FileDeleteException from './fileDeleteException';
import FileUploadException from './fileUploadException';
import DirectoryCreateException from './directoryCreateException';

const kAdapter: unique symbol = Symbol('adapter');
const kHandler: unique symbol = Symbol('handler');

/**
 * Class FilesystemAdapter.
 */
class FilesystemAdapter {
    [kAdapter]: any;
    [kHandler]: any;

    /**
     * Create a new instance.
     *
     * @param $adapter - Adapter instance.
     * @param $handler - Callback handler instance.
     */
    constructor($adapter: any, $handler: any) {
        this[kAdapter] = $adapter;
        this[kHandler] = $handler;
    }

    /**
     * exists method.
     *
     * @param $path - File path to check.
     * @param options - Check options.
     * @returns Promise resolving to boolean.
     */
    public exists($path: string, options?: Record<string, any>): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this[kAdapter].has($path, options, (err: any, data: any, basePath: string) => {
                this[kHandler].exists(null, err ? false : true, resolve, $path, options, basePath);
            });
        });
    }

    /**
     * path method.
     *
     * @param $path - Relative path.
     * @returns Resolved path.
     */
    public path($path: string): string {
        if (typeof this[kAdapter].applyPathPrefix == 'function') {
            return this[kAdapter].applyPathPrefix($path);
        }
        return this[kAdapter].getAdapter().getPathPrefix()[$path];
    }

    /**
     * get method.
     *
     * @param $path - File path to read.
     * @param options - Read options.
     * @returns Promise resolving to file contents.
     */
    get($path: string, options?: Record<string, any>): Promise<any> {
        return new Promise((resolve, reject) => {
            this[kAdapter].read($path, options, (err: any, data: any, basePath: string) => {
                if (err) {
                    this[kHandler].get(new FileNotFoundException(err), null, reject, $path, options, basePath);
                } else {
                    this[kHandler].get(null, (typeof data == 'function' ? data() : data), resolve, $path, options, basePath);
                }
            });
        });
    }

    /**
     * delete method.
     *
     * @param $path - File path to delete.
     * @param rest - Optional callback and options.
     * @returns Promise or adapter result.
     */
    public delete($path: string, ...rest: any[]): any {
        const restArr = Array.from(rest);
        const callback = restArr.find(arg => typeof arg == 'function');
        const options = restArr.find(arg => typeof arg == 'object') || {};
        if (callback) {
            return this[kAdapter].delete($path, options, callback);
        } else {
            return new Promise((resolve, reject) => {
                this[kAdapter].delete($path, options, (err: any, data: any, basePath: string) => {
                    if (err) {
                        this[kHandler].delete(new FileDeleteException(err), null, reject, $path, options, basePath);
                    } else {
                        this[kHandler].delete(null, (typeof data == 'function' ? data() : data), resolve, $path, options, basePath);
                    }
                });
            });
        }
    }

    /**
     * makeDirectory method.
     *
     * @param $path - Directory path to create.
     * @param options - Directory options.
     * @returns Promise resolving on completion.
     */
    public makeDirectory($path: string, options?: Record<string, any>): Promise<any> {
        return new Promise((resolve, reject) => {
            this[kAdapter].createDir($path, options, (err: any, data: any, basePath: string) => {
                if (err) {
                    this[kHandler].createDir(new DirectoryCreateException(err), null, reject, $path, options, basePath);
                } else {
                    this[kHandler].createDir(null, (typeof data == 'function' ? data() : data), resolve, $path, options, basePath);
                }
            });
        });
    }

    /**
     * put method.
     *
     * @param $path - File path to write.
     * @param content - File contents.
     * @param options - Write options.
     * @returns Promise resolving on completion.
     */
    public put($path: string, content: any, options: Record<string, any> = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            this[kAdapter].write($path, content, options, (err: any, data: any, basePath: string) => {
                if (err) {
                    this[kHandler].delete(new FileUploadException(err), null, reject, $path, options, basePath, content);
                } else {
                    this[kHandler].put(null, (typeof data == 'function' ? data() : data), resolve, $path, options, basePath);
                }
            });
        });
    }

    /**
     * putFile method.
     *
     * @param $path - Directory path.
     * @param $file - File object.
     * @param $options - Write options.
     * @returns Promise resolving to write result.
     */
    public putFile($path: string, $file: any, $options: Record<string, any> = {}): Promise<any> {
        return this.putFileAs($path, $file, $file.getHashname(), $options);
    }

    /**
     * putFileAs method.
     *
     * @param $path - Directory path.
     * @param $file - File object.
     * @param $name - Filename.
     * @param $options - Write options.
     * @returns Promise resolving to write result.
     */
    public putFileAs($path: string, $file: any, $name: string, $options: Record<string, any> = {}): Promise<any> {
        $path = path.join($path, $name);
        return this.put($path, $file.getBufferData(), $options);
    }

    /**
     * getAdapter method.
     *
     * @returns Underlying adapter instance.
     */
    public getAdapter(): any {
        return this[kAdapter];
    }
}

export default FilesystemAdapter;