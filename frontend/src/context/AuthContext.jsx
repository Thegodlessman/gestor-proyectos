
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 

    const apiLogin = async (email, password) => {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        setUser(data.usuario);
        setIsAuthenticated(true);
        return data;
    };

    const apiRegister = async (nombre, apellido, email, password) => {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, apellido, email, password }),
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        setUser(data.usuario);
        setIsAuthenticated(true);
        return data;
    };

    const apiLogout = async () => {
        await fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);
        setIsAuthenticated(false);
    };

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/auth/verificar', {
                    method: 'GET',
              
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.usuario);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('No hay sesión activa o error de red');
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false); 
            }
        };
        checkSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isAuthenticated, isLoading, login: apiLogin, register: apiRegister, logout: apiLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};


// import React, { createContext, useState, useContext, useEffect } from 'react';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [isLoading, setIsLoading] = useState(true); 

//     const apiLogin = async (email, password) => {
//         const response = await fetch('http://localhost:3000/api/auth/login', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ email, password }),
//             credentials: 'include',
//         });
//         const data = await response.json();
//         if (!response.ok) throw new Error(data.message);
        
//         setUser(data.usuario);
//         setIsAuthenticated(true);
//         return data;
//     };

//     const apiRegister = async (nombre, apellido, email, password) => {
//         const response = await fetch('http://localhost:3000/api/auth/register', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ nombre, apellido, email, password }),
//             credentials: 'include',
//         });
//         const data = await response.json();
//         if (!response.ok) throw new Error(data.message);

//         setUser(data.usuario);
//         setIsAuthenticated(true);
//         return data;
//     };

//     const apiLogout = async () => {
//         await fetch('http://localhost:3000/api/auth/logout', {
//             method: 'POST',
//             credentials: 'include',
//         });
//         setUser(null);
//         setIsAuthenticated(false);
//     };

//     useEffect(() => {
//         const checkSession = async () => {
//             try {
//                 const response = await fetch('http://localhost:3000/api/auth/verificar', {
//                     method: 'GET',
//                     // ---- LA CORRECCIÓN CLAVE ESTÁ AQUÍ ----
//                     // Añadimos 'credentials: include' para enviar la cookie de sesión
//                     credentials: 'include',
//                 });
//                 if (response.ok) {
//                     const data = await response.json();
//                     setUser(data.usuario);
//                     setIsAuthenticated(true);
//                 } else {
//                     // Si la respuesta no es OK (ej. 401), nos aseguramos de limpiar el estado
//                     setUser(null);
//                     setIsAuthenticated(false);
//                 }
//             } catch (error) {
//                 console.error('No hay sesión activa o error de red');
//                 setUser(null);
//                 setIsAuthenticated(false);
//             } finally {
//                 setIsLoading(false); 
//             }
//         };
//         checkSession();
//     }, []);

//     return (
//         <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login: apiLogin, register: apiRegister, logout: apiLogout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     return useContext(AuthContext);
// };


// import React, { createContext, useState, useContext, useEffect } from 'react';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [isLoading, setIsLoading] = useState(true); 

//     const apiLogin = async (email, password) => {
//         const response = await fetch('http://localhost:3000/api/auth/login', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ email, password }),
//             credentials: 'include',
//         });
//         const data = await response.json();
//         if (!response.ok) throw new Error(data.message);
        
//         setUser(data.usuario);
//         setIsAuthenticated(true);
//         return data;
//     };

//     const apiRegister = async (nombre, apellido, email, password) => {
//         const response = await fetch('http://localhost:3000/api/auth/register', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ nombre, apellido, email, password }),
//             credentials: 'include',
//         });
//         const data = await response.json();
//         if (!response.ok) throw new Error(data.message);

//         setUser(data.usuario);
//         setIsAuthenticated(true);
//         return data;
//     };

//     const apiLogout = async () => {
//         await fetch('http://localhost:3000/api/auth/logout', {
//             method: 'POST',
//             credentials: 'include',
//         });
//         setUser(null);
//         setIsAuthenticated(false);
//     };

//     useEffect(() => {
//         const checkSession = async () => {
//             try {
//                 const response = await fetch('http://localhost:3000/api/auth/verificar', {
//                     method: 'GET',
//                     credentials: 'include',
//                 });
//                 if (response.ok) {
//                     const data = await response.json();
//                     setUser(data.usuario);
//                     setIsAuthenticated(true);
//                 }
//             } catch (error) {
//                 console.error('No hay sesión activa');
//             } finally {
//                 setIsLoading(false); 
//             }
//         };
//         checkSession();
//     }, []);

//     return (
//         <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login: apiLogin, register: apiRegister, logout: apiLogout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     return useContext(AuthContext);
// };