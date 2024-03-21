export class EngageError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'EngageError'
  }
}
