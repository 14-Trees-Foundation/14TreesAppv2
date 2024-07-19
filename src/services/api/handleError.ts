export const handleApiError = (location: string, error: any) => {

    // log error details
    const date = new Date().toISOString();
    console.log(date, "[ERROR]", location, error.message, error.response?.data);

    // throw error messages to notify users
    if (error.response?.data?.message && error.response.data.message !== "") {
        throw new Error(error.response.data.message);
    }
    throw new Error('Something went wrong. please try letter!');
}