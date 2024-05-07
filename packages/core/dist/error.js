"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngageError = void 0;
class EngageError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EngageError';
    }
}
exports.EngageError = EngageError;
