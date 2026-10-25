import path from 'node:path';
import url from 'node:url';
import { ensureDir } from 'fs-extra';

/**
 * Class CoreAdapter.
 */
class CoreAdapter {
    #config: Record<string, any> | null = null;
    #rootPath: string = '';
    #rootUrlPath: string = '';

    /**
     * setConfig method.
     *
     * @param config - Configuration object.
     */
    public setConfig(config: Record<string, any>): void {
        this.#config = config;
    }

    /**
     * getConfig method.
     *
     * @returns Configuration object or null.
     */
    public getConfig(): Record<string, any> | null {
        return this.#config || null;
    }

    /**
     * setPathPrefix method.
     *
     * @param root - Root directory path prefix.
     */
    public setPathPrefix(root: string): void {
        this.#rootPath = root;
    }

    /**
     * setUrlPrefix method.
     *
     * @param root - Root URL prefix.
     */
    public setUrlPrefix(root: string): void {
        this.#rootUrlPath = root;
    }

    /**
     * applyPathPrefix method.
     *
     * @param dest - Target path.
     * @returns Resolved absolute path.
     */
    public applyPathPrefix(dest: string): string {
        return path.resolve(path.join(this.#rootPath, path.join('/', path.normalize(dest))));
    }

    /**
     * applyUrlPrefix method.
     *
     * @param dest - Target path or URL segment.
     * @returns Resolved URL string.
     */
    public applyUrlPrefix(dest?: string): string {
        return url.resolve(([this.#rootUrlPath, (dest || '')].join('/')), '');
    }

    /**
     * ensureDirectory method.
     *
     * @param dir - Directory path to ensure exists.
     * @param callback - Completion callback.
     */
    ensureDirectory(dir: string, callback: (err?: any) => void): void {
        ensureDir(dir, callback);
    }

    /**
     * parsePath method.
     *
     * @param dest - Path to parse.
     * @returns Parsed path object.
     */
    public parsePath(dest: string): path.ParsedPath {
        return path.parse(dest);
    }

    /**
     * dirname method.
     *
     * @param dest - Path to get directory name of.
     * @returns Directory path.
     */
    public dirname(dest: string): string {
        return this.parsePath(dest).dir;
    }

    /**
     * getContent method.
     *
     * @param content - Content or array of contents.
     * @returns Single content element.
     */
    public getContent<T = unknown>(content: T | T[]): T {
        if (Array.isArray(content)) {
            return content[0];
        } else {
            return content;
        }
    }

    /**
     * getBufferData method.
     *
     * @param content - Content containing buffer.
     * @returns Buffer instance.
     */
    public getBufferData(content: any): any {
        return this.getContent(content).buffer;
    }

    /**
     * move method.
     *
     * @param path - Source path.
     * @param newpath - Destination path.
     * @param callback - Result callback.
     */
    public move(path: string, newpath: any, callback: Function): void {
        callback(this.formatError({ message: 'there was no such functionality available.' }), {});
    }

    /**
     * delete method.
     *
     * @param $path - Target path.
     * @param options - Deletion options.
     * @param callback - Result callback.
     */
    public delete($path: string, options: Record<string, any> = {}, callback: Function): void {
        callback(this.formatError({ message: 'there was no such functionality available.' }), {});
    }

    /**
     * has method.
     *
     * @param $path - Target path.
     * @param options - Check options.
     * @param callback - Result callback.
     */
    public has($path: string, options: Record<string, any> = {}, callback: Function): void {
        callback(this.formatError({ message: 'there was no such functionality available.' }), {});
    }

    /**
     * write method.
     *
     * @param $path - Target path.
     * @param $contents - Contents to write.
     * @param options - Write options.
     * @param rest - Additional arguments including callback.
     */
    public write($path: string, $contents: any, options: Record<string, any> = {}, ...rest: any[]): void {
        const callback: Function = Array.from(rest).find(arg => typeof arg == 'function') || (typeof options == 'function' ? options : () => {});
        callback(this.formatError({ message: 'there was no such functionality available.' }), {});
    }

    /**
     * read method.
     *
     * @param $path - Target path.
     * @param options - Read options.
     * @param callback - Result callback.
     */
    public read($path: string, options: Record<string, any> = {}, callback: Function): void {
        callback(this.formatError({ message: 'there was no such functionality available.' }), {});
    }

    /**
     * formatError method.
     *
     * @param err - Inner error.
     * @returns Formatted error object.
     */
    public formatError(err: unknown): { message: string; errors: unknown; status: number } {
        return {
            'message': 'Storage Error',
            'errors': err,
            'status': 500
        };
    }
}

export default CoreAdapter;