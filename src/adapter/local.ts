import fs from 'fs-extra';
import CoreAdapter from './CoreAdapter';
import path from 'path';
import { v4 } from 'uuid';

const kHandler: unique symbol = Symbol('handler');

/**
 * Class Local.
 */
class Local extends CoreAdapter {
    [kHandler]: any;

    /**
     * Create a new instance.
     *
     * @param root - Base root directory.
     * @param $config - Configuration object.
     */
    constructor(root: string = '', $config: Record<string, any>) {
        super();
        this.setPathPrefix(root);
        this.setConfig($config);
        this[kHandler] = (typeof $config.handler == 'function' ? new $config.handler() : (typeof $config.handler == 'object' ? $config.handler : {}));
    }

    /**
     * move method.
     *
     * @param path - Source path.
     * @param newpath - Destination path.
     * @param callback - Optional completion callback.
     * @returns Promise if no callback, or void.
     */
    public move(path: string, newpath: any, callback?: Function): any {
        if (callback) {
            return fs.move(path, newpath, {
                overwrite: true
            }, function(err, res) {
                callback(err, res, newpath);
            });
        } else {
            return fs.move(path, newpath, {
                overwrite: true
            });
        }
    }

    /**
     * delete method.
     *
     * @param $path - File or directory path to delete.
     * @param options - Deletion options.
     * @param callback - Completion callback.
     */
    public delete($path: string, options: Record<string, any> = {}, callback: Function): void {
        const location: string = this.applyPathPrefix($path);
        fs.remove(location, (error) => {
            if (typeof this[kHandler].delete == 'function') {
                this[kHandler].delete({
                    basePath: location,
                    path: $path,
                    options,
                    callback,
                    error,
                });
            } else {
                callback(error, true, location);
            }
        });
    }

    /**
     * createDir method.
     *
     * @param $path - Directory path to create.
     * @param options - Directory options.
     * @param callback - Completion callback.
     */
    public createDir($path: string, options: Record<string, any> = {}, callback: Function): void {
        const location: string = this.applyPathPrefix($path);
        fs.mkdir(location, { recursive: true }, (error) => {
            if (typeof this[kHandler].createDir == 'function') {
                this[kHandler].createDir({
                    path: $path,
                    options,
                    callback,
                    error,
                });
            } else {
                callback(error, true, location);
            }
        });
    }

    /**
     * has method.
     *
     * @param $path - File path to check.
     * @param options - Access options.
     * @param callback - Result callback.
     */
    public has($path: string, options: { constants: keyof typeof fs.constants | string } = { constants: 'F_OK' }, callback: Function): void {
        const location: string = this.applyPathPrefix($path);
        fs.access(location, (fs.constants as any)[options.constants], (error) => {
            if (typeof this[kHandler].has == 'function') {
                this[kHandler].has({
                    basePath: location,
                    path: $path,
                    options,
                    callback,
                    error,
                });
            } else {
                callback(error, true);
            }
        });
    }

    /**
     * write method.
     *
     * @param $path - File path to write to.
     * @param $contents - Content to write.
     * @param options - Write options.
     * @param rest - Extra arguments including callback.
     */
    public write($path: string, $contents: any, options: Record<string, any> = {}, ...rest: any[]): void {
        const callback: Function = Array.from(rest).find(arg => typeof arg == 'function') as Function;
        const location: string = this.applyPathPrefix($path);
        fs.stat(location).then(res => {
            if (res.isDirectory()) {
                return path.join(location, v4());
            }
            return location;
        })
        .catch(() => location)
        .then(loc => {
            this.ensureDirectory(this.dirname(loc), () => {
                fs.writeFile(loc, $contents, (error, data) => {
                    if (typeof this[kHandler].write == 'function') {
                        this[kHandler].write({
                            basePath: loc,
                            path: $path,
                            options,
                            callback,
                            error,
                            content: $contents
                        });
                    } else {
                        callback(error, {
                            'type': 'file',
                            'path': $path,
                            'message': 'File created successfully'
                        }, loc);
                    }
                });
            });
        });
    }

    /**
     * read method.
     *
     * @param $path - File path to read from.
     * @param options - Read options.
     * @param callback - Result callback.
     */
    public read($path: string, options: Record<string, any> = {}, callback: Function): void {
        const location: string = this.applyPathPrefix($path);
        fs.readFile(location, {
            encoding: (this.getConfig()?.encoding || (options.encoding || 'utf-8'))
        }, (error, data) => {
            if (typeof this[kHandler].read == 'function') {
                this[kHandler].read({
                    basePath: location,
                    path: $path,
                    options,
                    callback,
                    error,
                    response: data
                });
            } else {
                callback(error, {
                    'type': 'file',
                    'path': $path,
                    'contents': data
                }, location);
            }
        });
    }

    /**
     * global method.
     *
     * @param $path - Optional path.
     * @param options - Optional options.
     * @param callback - Optional callback.
     */
    public global($path?: string, options: Record<string, any> = {}, callback?: Function): void {
    }
}

export default Local;
