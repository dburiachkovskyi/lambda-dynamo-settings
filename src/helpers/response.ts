export const responses = {
  success: (data: any) => ({
    statusCode: 200,
    body: JSON.stringify(data, null, 2),
  }),
  error: (message: string) => ({
    statusCode: 400,
    message,
    body: '',
  }),
};
