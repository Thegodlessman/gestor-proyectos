SELECT 
    r.nombre_rol,
    o.nombre_opcion,
    p.nombre_permiso
FROM rol_permisos rp
JOIN roles r ON rp.rol_id = r.id
JOIN opciones o ON rp.opcion_id = o.id
JOIN permisos p ON rp.permiso_id = p.id
ORDER BY r.nombre_rol, o.nombre_opcion;