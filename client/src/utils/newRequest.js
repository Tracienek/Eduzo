import axios from "axios";

const newRequest = axios.create({
    baseURL:
        (import.meta.env.VITE_ENV === "production"
            ? import.meta.env.VITE_SERVER_ORIGIN
            : import.meta.env.VITE_SERVER_LOCAL_ORIGIN) + "/v1/api",
    withCredentials: true,
});

const getLoggedInRequestConfig = (data) => {
    let contentType = "application/json";
    if (data instanceof FormData) {
        contentType = "multipart/form-data";
    }
    return {
        headers: {
            "Content-Type": contentType,
        },
        withCredentials: true,
    };
};

const apiUtils = {
    async get(url, config = {}) {
        const requestConfig = { ...getLoggedInRequestConfig(), ...config };
        return newRequest.get(url, requestConfig);
    },

    async post(url, data = {}, config = {}) {
        const requestConfig = { ...getLoggedInRequestConfig(data), ...config };
        return newRequest.post(url, data, requestConfig);
    },

    async put(url, data = {}, config = {}) {
        const requestConfig = { ...getLoggedInRequestConfig(data), ...config };
        return newRequest.put(url, data, requestConfig);
    },

    async patch(url, data = {}, config = {}) {
        const requestConfig = { ...getLoggedInRequestConfig(data), ...config };
        return newRequest.patch(url, data, requestConfig);
    },

    async delete(url, config = {}) {
        const requestConfig = { ...getLoggedInRequestConfig(), ...config };
        return newRequest.delete(url, requestConfig);
    },
};

function createFormData(inputs, filesKey, files) {
    const formData = new FormData();

    Object.keys(inputs).forEach((key) => {
        const value = inputs[key];

        if (Array.isArray(value)) {
            // If it's an array of objects → stringify the whole array
            if (value.length > 0 && typeof value[0] === "object") {
                formData.append(key, JSON.stringify(value)); // e.g., for embeddedUrlsRaw
            } else {
                // array of primitives (e.g. strings, numbers)
                value.forEach((item) => formData.append(`${key}[]`, item));
            }
        } else {
            formData.append(key, value);
        }
    });

    // Append file inputs
    files?.forEach((file) => {
        if (file) {
            formData.append(filesKey, file);
        }
    });

    return formData;
}

export { createFormData, newRequest, apiUtils };
