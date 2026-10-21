import DirectoryCreateExceptionContract from '@ostro/contracts/filesystem/directoryCreateException';

/**
 * Class DirectoryCreateException.
 */
class DirectoryCreateException extends DirectoryCreateExceptionContract {
    public name: string;
    public message: string;
    public errors: unknown;
    public statusCode: number;

    /**
     * Create a new instance.
     *
     * @param errors - Error details or message.
     */
    constructor(errors: unknown) {
        super();
        this.name = this.constructor.name;
        this.message = 'Unable to create directory';
        this.errors = errors;
        this.statusCode = 404;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default DirectoryCreateException;