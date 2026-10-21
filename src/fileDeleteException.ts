import FileNotFoundExceptionContract from '@ostro/contracts/filesystem/fileNotFoundException';

/**
 * Class FileNotFoundException.
 */
class FileNotFoundException extends FileNotFoundExceptionContract {
    public name: string;
    public message: string;
    public errors: unknown;
    public statusCode: number;

    /**
     * Create a new instance.
     *
     * @param errors - Error details or message.
     * @param path - File path that failed to delete.
     */
    constructor(errors: unknown, path?: string) {
        super();
        this.name = this.constructor.name;
        this.message = 'Unable to delete ';
        this.errors = errors;
        this.statusCode = 500;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default FileNotFoundException;