class EngageError extends Error {
  constructor (message, cause) {
    super(message)
    this.cause = cause
    this.name = 'EngageError'
  }
}
module.exports = EngageError
