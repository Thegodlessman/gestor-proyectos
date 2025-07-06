
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { PrimeReactProvider } from 'primereact/api';

import 'primereact/resources/themes/lara-light-indigo/theme.css'; 
import 'primereact/resources/primereact.min.css';              
import 'primeicons/primeicons.css';                             
import 'primeflex/primeflex.css';                               
import './index.css';                                           

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </PrimeReactProvider>
  </React.StrictMode>
);


// v2

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';

// // ---- ESTILOS GLOBALES (RUTA DE TEMA CORREGIDA) ----
// import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Tema corregido
// import 'primereact/resources/primereact.min.css';                // Core CSS
// import 'primeicons/primeicons.css';                               // Iconos
// import 'primeflex/primeflex.css';                                 // Utilidades Flex
// import './index.css';                                             // Tus estilos de Tailwind

// import { BrowserRouter } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <AuthProvider>
//         <App />
//       </AuthProvider>
//     </BrowserRouter>
//   </React.StrictMode>
// );



// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App.jsx';

// import 'bootstrap/dist/css/bootstrap.min.css';
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// );