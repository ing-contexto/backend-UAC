-- SELECT
--     m.nombre AS municipio,
--     d.nombre AS distrito,
--     r.nombre AS region,
--     mc.nombre AS municipio_colindante,
--     pc.nombre AS punto_cardinal
-- FROM 
--     Municipio m
-- INNER JOIN Distrito d ON m.distritoID = d.ID
-- INNER JOIN Region r ON d.regionID = r.ID
-- LEFT JOIN MunicipioColindante col ON m.ID = col.municipioID
-- LEFT JOIN Municipio mc ON col.colindanteID = mc.ID
-- LEFT JOIN PuntosCardinales pc ON col.puntoCardinalID = pc.ID
-- WHERE 
--     m.ID IN (1, 2);
-- SELECT id FROM Municipio WHERE nombre="San Miguel Aloápam"
-- SELECT id FROM PuntosCardinales WHERE nombre="Este"
-- INSERT INTO MunicipioColindante VALUES (null, (SELECT id FROM Municipio WHERE nombre="Abejones"), (SELECT id FROM Municipio WHERE nombre="San Miguel Amatlán"), (SELECT id FROM PuntosCardinales WHERE nombre="Norte"))
SELECT m.ID as ID,
    m.nombre AS nombre,
    d.nombre AS distrito,
    r.nombre AS region,
    mc.nombre AS colindantes,
    pc.nombre AS cardenal
FROM Municipio m
    INNER JOIN Distrito d ON m.distritoID = d.ID
    INNER JOIN Region r ON d.regionID = r.ID
    LEFT JOIN MunicipioColindante col ON m.ID = col.municipioID
    LEFT JOIN Municipio mc ON col.colindanteID = mc.ID
    LEFT JOIN PuntosCardinales pc ON col.puntoCardinalID = pc.ID
WHERE m.ID IN (1, 2)