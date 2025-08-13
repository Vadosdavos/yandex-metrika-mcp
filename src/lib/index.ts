export const withErrorHandling = <T extends Record<string, any>>(
  handler: (params: T) => Promise<any>
) => {
  return async (params: T) => {
    try {
      return await handler(params);
    } catch (error) {
      return {
        content: [
          { type: 'text', text: `Something went wrong. Error: ${error}` },
        ],
      };
    }
  };
};