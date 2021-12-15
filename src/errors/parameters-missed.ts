export class ParametersMissedException extends Error {
  constructor(params: string[]) {
    super(`Parameters ${params.join(', ')} are missed!`);
  }
}
