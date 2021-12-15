import { APIGatewayProxyEventPathParameters } from 'aws-lambda';

export interface Setting {
  id: string;
  key: string;
  value: string;
}

export interface RequestByIdParameters {
  id: string;
}

export interface MiddyEvent<T = any, P = APIGatewayProxyEventPathParameters> {
  body: T;
  pathParameters: P;
}
