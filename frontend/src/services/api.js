import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = 'http://localhost:3000';

/**
 * 
 * @param {string} endpoint - 
 * @param {object} options - 
 * @returns {Promise<any>} -
 */
async function fetchApi(endpoint, options = {}) {
    options.credentials = 'include';
    if (options.body) {
        options.headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.shortMsg || responseData.message || 'Ocurrió un error en la API.');
    }

    if (responseData.hasOwnProperty('data')) {
        return responseData.data;
    } else {
        return responseData;
    }
}

/**
 * Llama a un método del backend usando el patrón RPC.
 * @param {string} objectName - El nombre del Business Object (ej. 'Project').
 * @param {string} methodName - El nombre del método a ejecutar (ej. 'crear').
 * @param {object} params - Los parámetros para el método.
 */
export const rpcCall = (objectName, methodName, params = {}) => {
    const tx = uuidv4();
    
    return fetchApi('/toProcess', {
        method: 'POST',
        body: JSON.stringify({ objectName, methodName, params, tx }),
    });
};

export const getSecurityQuestions = () => {
    return fetchApi('/security/questions');
};

export const setSecurityAnswer = (pregunta_id, respuesta) => {
    return fetchApi('/security/answers', {
        method: 'POST',
        body: JSON.stringify({ pregunta_id, respuesta }),
    });
};