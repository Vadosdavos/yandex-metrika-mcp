export const withErrorHandling = (handler) => {
    return async (params) => {
        try {
            return await handler(params);
        }
        catch (error) {
            return {
                content: [
                    { type: 'text', text: `Something went wrong. Error: ${error}` },
                ],
            };
        }
    };
};
