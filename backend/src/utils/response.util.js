/**
 * Formatea una respuesta exitosa.
 * @param {string} tx - El ID de la transacción original.
 * @param {object} data - Los datos a enviar.
 * @param {string} shortMsg - Mensaje corto.
 * @returns {object} Objeto de respuesta estándar.
 */

export function formatResponse(tx, data, shortMsg = 'Operación exitosa.') {
    return {
        tx: tx,
        status: 'OK', 
        typeMsg: 'info',
        shortMsg: shortMsg,
        longMsg: '', 
        data: data
    };
}

/**
 * Formatea una respuesta de error.
 * @param {string} tx - El ID de la transacción original.
 * @param {Error} error - El objeto de error capturado.
 * @param {string} customMsg - Un mensaje personalizado para el usuario.
 * @returns {object} Objeto de error estándar.
 */

export function formatError(tx, error, customMsg = 'Ocurrió un error inesperado.') {
    return {
        tx: tx,
        status: 'ERROR', 
        typeMsg: 'error',
        shortMsg: customMsg,
        longMsg: error.message, 
        data: {}
    };
}