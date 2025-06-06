const API_BASE_URL = 'http://localhost:3000/api';

// Función genérica para manejar las peticiones fetch
async function fetchApi(endpoint, options = {}) {
    options.credentials = 'include';
    
    if (options.body) {
        options.headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Ocurrió un error en la petición a la API.');
    }

    return data;
}

// Funciones específicas para cada endpoint
export const getSecurityQuestions = () => fetchApi('/security/questions');

export const setSecurityAnswer = (pregunta_id, respuesta) => {
    return fetchApi('/security/answers', {
        method: 'POST',
        body: JSON.stringify({ pregunta_id, respuesta }),
    });
};