import { RpcException } from '@nestjs/microservices';

export interface SerializedException {
    message: string;
    code: string;
    stack?: string;
    cause?: string;
    metadata?: unknown;
}

export abstract class ExceptionBase extends Error {
    abstract code: string;
    readonly metadata?: unknown;
    readonly cause?: Error;

    constructor(message: string, cause?: Error, metadata?: unknown) {
        super(message);
        this.name = new.target.name;
        this.cause = cause;
        this.metadata = metadata;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    toJSON(): SerializedException {
        return {
            message: this.message,
            code: this.code,
            stack: this.stack,
            cause: JSON.stringify(this.cause),
            metadata: this.metadata,
        };
    }
    toRpcException(): RpcException {
        return new RpcException(this.toJSON());
    }
}