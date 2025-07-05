
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSecurityQuestions, setSecurityAnswer } from '../services/api'; 

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';

function Security() {
    const { user } = useAuth(); 
    const toast = useRef(null);

    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null); 
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadQuestions = async () => {
            setIsLoading(true);
            try {
                const data = await getSecurityQuestions();
                setQuestions(data || []); 
                
                if (data && data.length > 0) {
                   
                    setSelectedQuestion(data[0].id); 
                }
            } catch (error) {
                if (toast.current) {
                    toast.current.show({ 
                        severity: 'error', 
                        summary: 'Error de Carga', 
                        detail: error.message || 'No se pudieron cargar las preguntas.' 
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadQuestions();
    }, []); 

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedQuestion || !answer.trim()) {
            toast.current.show({ severity: 'warn', summary: 'Atención', detail: 'Por favor, selecciona una pregunta y escribe una respuesta.' });
            return;
        }

        setIsSaving(true);
        try {
          
            const data = await setSecurityAnswer(selectedQuestion, answer);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: data.message });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error al Guardar', detail: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Card title="Seguridad de la Cuenta">
                <Skeleton height="15rem"></Skeleton>
            </Card>
        );
    }

    return (
        <>
            <Toast ref={toast} />
            <Card title="Preguntas de Seguridad" subTitle="Configura tu pregunta para recuperar tu cuenta en el futuro.">
                <form onSubmit={handleSubmit}>
                    <div className="p-fluid flex flex-column gap-4">
                        <div className="field">
                            <label htmlFor="security-question" className="font-bold block mb-2">Elige una pregunta</label>
                            <Dropdown
                                id="security-question" 
                                value={selectedQuestion}
                                options={questions}
                                onChange={(e) => setSelectedQuestion(e.value)}
                                optionLabel="pregunta_texto" 
                                optionValue="id"
                                placeholder="Selecciona una pregunta"
                                filter
                                emptyMessage="No hay preguntas disponibles"
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="security-answer" className="font-bold block mb-2">Tu Respuesta Secreta</label>
                            <InputText
                                id="security-answer"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Escribe tu respuesta aquí"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-content-end mt-4">
                        <Button type="submit" label="Guardar Respuesta" loading={isSaving} />
                    </div>
                </form>
            </Card>
        </>
    );
}

// Se exporta con el nombre correcto para que coincida con App.jsx
export default Security;




// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { getSecurityQuestions, setSecurityAnswer } from '../services/api';

// function SecurityPage() {
//     const [questions, setQuestions] = useState([]);
//     const [selectedQuestion, setSelectedQuestion] = useState('');
//     const [answer, setAnswer] = useState('');
//     const [isLoading, setIsLoading] = useState(true);
//     const [message, setMessage] = useState({ type: '', text: '' });

//     useEffect(() => {
//         // Al cargar el componente, obtenemos la lista de preguntas
//         const loadQuestions = async () => {
//             try {
//                 const data = await getSecurityQuestions();
//                 setQuestions(data);
//                 if (data.length > 0) {
//                     setSelectedQuestion(data[0].id); 
//                 }
//             } catch (error) {
//                 setMessage({ type: 'danger', text: error.message });
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         loadQuestions();
//     }, []); 

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setMessage({ type: '', text: '' }); 
//         if (!selectedQuestion || !answer) {
//             setMessage({ type: 'danger', text: 'Por favor, selecciona una pregunta y escribe una respuesta.' });
//             return;
//         }

//         try {
//             const data = await setSecurityAnswer(selectedQuestion, answer);
//             setMessage({ type: 'success', text: data.message });
//         } catch (error) {
//             setMessage({ type: 'danger', text: error.message });
//         }
//     };

//     if (isLoading) {
//         return <div>Cargando preguntas...</div>;
//     }

//     return (
//         <div className="container mt-5">
//             <div className="row justify-content-center">
//                 <div className="col-md-8 col-lg-6">
//                     <div className="card bg-dark text-white">
//                         <div className="card-body">
//                             <h2 className="card-title text-center text-primary mb-4">Preguntas de Seguridad</h2>
//                             <p className="text-body-secondary text-center">Configura tu pregunta de seguridad para poder recuperar tu cuenta en el futuro.</p>
                            
//                             {message.text && (
//                                 <div className={`alert alert-${message.type}`} role="alert">
//                                     {message.text}
//                                 </div>
//                             )}

//                             <form onSubmit={handleSubmit}>
//                                 <div className="mb-3">
//                                     <label htmlFor="security-question" className="form-label">Elige una pregunta</label>
//                                     <select 
//                                         id="security-question" 
//                                         className="form-select"
//                                         value={selectedQuestion}
//                                         onChange={(e) => setSelectedQuestion(e.target.value)}
//                                     >
//                                         {questions.map((q) => (
//                                             <option key={q.id} value={q.id}>
//                                                 {q.pregunta_texto}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div className="mb-3">
//                                     <label htmlFor="security-answer" className="form-label">Tu Respuesta Secreta</label>
//                                     <input 
//                                         type="text" 
//                                         id="security-answer"
//                                         className="form-control"
//                                         value={answer}
//                                         onChange={(e) => setAnswer(e.target.value)}
//                                         required
//                                     />
//                                 </div>
//                                 <div className="d-grid gap-2">
//                                     <button type="submit" className="btn btn-primary">Guardar Respuesta</button>
//                                     <Link to="/dashboard" className="btn btn-secondary">Volver al Dashboard</Link>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default SecurityPage;