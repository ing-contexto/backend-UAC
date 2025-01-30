SELECT m.nombre, d.nombre, r.nombre FROM Municipio m INNER JOIN Distrito d ON m.ID = d.ID INNER JOIN Region r ON d.regionID=r.ID  WHERE m.ID in (1,2) 

