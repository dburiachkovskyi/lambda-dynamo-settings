import middy, { MiddyfiedHandler } from '@middy/core';
import bodyParser from '@middy/http-json-body-parser';
import { DynamoDB } from 'aws-sdk';
import { v4 } from 'uuid';
import {
  checkForParameters,
  updateByPassedValues,
} from '../helpers/attributes';
import { responses } from '../helpers/response';
import { MiddyEvent, Setting } from '../interfaces';

const { DocumentClient } = DynamoDB;

const addSetting: MiddyfiedHandler<MiddyEvent<Exclude<Setting, 'id'>>> = middy(
  async (event) => {
    const db = new DocumentClient();
    const setting = event.body;
    const createdAt = new Date().toISOString();
    const id = v4();

    const data = {
      ...setting,
      id,
      createdAt,
      updatedAt: createdAt,
    };

    await db
      .put({
        TableName: 'SettingsTable',
        Item: data,
      })
      .promise();

    return responses.success(data);
  }
);

export const fetchSettings: MiddyfiedHandler = middy(async () => {
  try {
    const db = new DocumentClient();
    const data = (
      await db
        .scan({
          TableName: 'SettingsTable',
        })
        .promise()
    ).Items;

    return responses.success(data);
  } catch (e) {
    console.error(e);
    return responses.error((e as Error).message);
  }
});

const fetchSetting: MiddyfiedHandler<MiddyEvent<void>> = middy(async (event) => {
  try {
    checkForParameters(event.pathParameters, ['id']);
    const db = new DocumentClient();
    const id = event.pathParameters?.id;
    const data = (
      await db
        .get({
          TableName: 'SettingsTable',
          Key: {
            id,
          },
        })
        .promise()
    ).Item;

    return responses.success(data);
  } catch (e) {
    console.error(e);
    return responses.error((e as Error).message);
  }
});

const updateSetting: MiddyfiedHandler<MiddyEvent<Partial<Setting>>> = middy(
  async (event) => {
    try {
      checkForParameters(event.pathParameters, ['id']);
      const db = new DocumentClient();
      const id = event.pathParameters?.id;
      const data = (
        await db
          .update({
            TableName: 'SettingsTable',
            Key: {
              id,
            },
            ...updateByPassedValues<Setting>(event.body),
            ReturnValues: 'UPDATED_NEW',
          })
          .promise()
      ).Attributes;

      return responses.success(data);
    } catch (e) {
      console.error(e, {
        TableName: 'SettingsTable',
        Key: {
          id: event.pathParameters?.id,
        },
        ...updateByPassedValues<Setting>(event.body),
        ReturnValues: 'UPDATED_NEW',
      });
      return responses.error((e as Error).message);
    }
  }
);

const deleteSetting: MiddyfiedHandler<MiddyEvent<void>> = middy(
  async (event) => {
    try {
      checkForParameters(event.pathParameters, ['id']);
      const db = new DocumentClient();
      const id = event.pathParameters?.id;
      const data = (
        await db
          .delete({
            TableName: 'SettingsTable',
            Key: {
              id,
            },
          })
          .promise()
      ).Attributes;

      return responses.success(data);
    } catch (e) {
      console.error(e);
      return responses.error((e as Error).message);
    }
  }
);

module.exports = {
  fetchSetting: fetchSetting.use(bodyParser()),
  updateSetting: updateSetting.use(bodyParser()),
  deleteSetting,
  addSetting: addSetting.use(bodyParser()),
  fetchSettings,
};
