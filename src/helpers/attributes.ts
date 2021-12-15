import { APIGatewayProxyEventPathParameters } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { chain, isUndefined } from 'lodash';
import { ParametersMissedException } from '../errors/parameters-missed';

export const checkForParameters = (
  parameters: APIGatewayProxyEventPathParameters,
  checkFor: string[]
) =>
  chain(checkFor)
    .filter((key) => !parameters[key])
    .tap((missedKeys) => {
      if (missedKeys.length) throw new ParametersMissedException(missedKeys);
    })
    .isLength()
    .value();

export const updateByPassedValues = <T>(
  data: Partial<T>
): Pick<
  DocumentClient.UpdateItemInput,
  'UpdateExpression' | 'ExpressionAttributeValues' | 'ExpressionAttributeNames'
> => {
  const newData = { ...data, updatedAt: new Date().toISOString() };
  const actualValues = chain(newData)
    .entries()
    .filter(([, value]) => !isUndefined(value))
    .value();
  return {
    UpdateExpression: `set ${actualValues.reduce(
      (acc, [key]) => `${acc}${acc ? ', ' : ''}#${key} = :${key}`,
      ``
    )}`,
    ExpressionAttributeNames: actualValues.reduce(
      (acc, [key]) => ({
        ...acc,
        [`#${key}`]: key,
      }),
      {}
    ),
    ExpressionAttributeValues: actualValues.reduce(
      (acc, [key, value]) => ({
        ...acc,
        [`:${key}`]: value,
      }),
      {}
    ),
  };
};
