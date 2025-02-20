-- SELECT m.ID AS clave,
--     m.nombre AS nombre,
--     d.nombre AS distrito,
--     r.nombre AS region,
--     GROUP_CONCAT(
--         DISTINCT mc.nombre
--         ORDER BY mc.nombre SEPARATOR '; '
--     ) AS colindantes,
--     GROUP_CONCAT(
--         DISTINCT hr.titulo
--         ORDER BY hr.fecha DESC SEPARATOR ' ||| '
--     ) AS hechos
-- FROM Municipio m
--     INNER JOIN Distrito d ON m.distritoID = d.ID
--     INNER JOIN Region r ON d.regionID = r.ID
--     LEFT JOIN MunicipioColindante col ON m.ID = col.municipioID
--     LEFT JOIN Municipio mc ON col.colindanteID = mc.ID
--     LEFT JOIN Municipio_HechosRecientes mhr ON m.ID = mhr.municipioID
--     LEFT JOIN HechosRecientes hr ON mhr.hechosRecientesID = hr.ID
-- WHERE m.ID IN (1)
-- GROUP BY m.ID,
--     m.nombre,
--     d.nombre,
--     r.nombre;
SELECT hr.ID AS id_hecho,
    hr.titulo AS titulo,
    hr.fecha AS fecha,
    hr.descripcion AS descripcion,
    GROUP_CONCAT(
        DISTINCT m.nombre
        ORDER BY m.nombre SEPARATOR '; '
    ) AS municipios
FROM HechosRecientes hr
    LEFT JOIN Municipio_HechosRecientes mhr ON hr.ID = mhr.hechosRecientesID
    LEFT JOIN Municipio m ON mhr.municipioID = m.ID
GROUP BY hr.ID,
    hr.titulo,
    hr.fecha,
    hr.descripcion
HAVING SUM(m.ID IN (1, 3)) > 0
ORDER BY hr.fecha DESC;