import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts'; // Importamos el componente de la nueva librería
import { rpcCall } from '../services/api';

const GanttChart = ({ projectId }) => {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Opciones de configuración para el gráfico de ApexCharts
    const chartOptions = {
        chart: {
            background: 'transparent',
            toolbar: { show: true }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                distributed: true, // Cada barra puede tener un color diferente
                dataLabels: {
                    hideOverflowingLabels: false
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function(val, opts) {
                const label = opts.w.globals.labels[opts.dataPointIndex];
                return label;
            },
            style: {
                colors: ['#f8f9fa', '#343a40'],
                fontWeight: 600,
            },
        },
        xaxis: {
            type: 'datetime',
            labels: { style: { colors: '#adb5bd' } }
        },
        yaxis: {
            show: false // Ocultamos las etiquetas del eje Y, ya que están en las barras
        },
        grid: {
            borderColor: '#495057',
            row: {
                colors: ['transparent', 'rgba(255, 255, 255, 0.05)'], // Alterna colores de fila
                opacity: 0.5
            },
        },
        tooltip: {
            theme: 'dark'
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!projectId) return;
            setLoading(true);
            try {
                const result = await rpcCall('Report', 'getGanttData', { proyecto_id: projectId });

                // Transformamos los datos al formato que espera ApexCharts
                const formattedSeries = [{
                    data: result.map(task => ({
                        x: task.nombre,
                        y: [
                            new Date(task.fecha_inicio).getTime(),
                            new Date(task.fecha_fin).getTime()
                        ],
                        fillColor: `hsl(${Math.random() * 360}, 50%, 60%)` // Asigna un color aleatorio
                    }))
                }];
                setSeries(formattedSeries);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectId]);

    if (loading) return <p>Cargando diagrama de Gantt...</p>;
    if (error) return <div className="text-red-500">Error: {error}</div>;
    if (series.length === 0 || series[0].data.length === 0) return <p>No hay actividades para mostrar.</p>;

    return (
        <div className="card bg-dark p-4 mt-4">
            <h3 className="text-xl font-semibold mb-4">Línea de Tiempo del Proyecto (Gantt)</h3>
            <Chart
                options={chartOptions}
                series={series}
                type="rangeBar"
                height={series[0].data.length * 50 + 50} // Altura dinámica según el número de tareas
            />
        </div>
    );
};

export default GanttChart;