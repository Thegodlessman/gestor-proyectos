import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Función genérica para manejar las peticiones fetch y el formato de respuesta "sobre".
 * @param {string} endpoint - El endpoint de la API al que llamar (ej. '/rpc').
 * @param {object} options - Opciones para la petición fetch.
 * @returns {Promise<any>} - La propiedad 'data' de la respuesta del backend.
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

    if (!response.ok || responseData.typeMsg === 'error') {
        throw new Error(responseData.shortMsg || 'Ocurrió un error en la API.');
    }
    return responseData.data;
}

/**
 * Nuestra función RPC genérica que todos los componentes usarán.
 * @param {string} method - El nombre del método RPC a llamar (ej. 'invitaciones.crear').
 * @param {object} params - Los parámetros para el método.
 * @returns {Promise<any>}
 */

export const rpcCall = (method, params = {}) => {
  const tx = uuidv4(); 
  
  return fetchApi('/rpc', {
    method: 'POST',

    // El cuerpo contiene la estructura que espera nuestro dispatcher
    body: JSON.stringify({ method, params, tx }),
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