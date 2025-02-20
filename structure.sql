CREATE TABLE Region (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE Distrito (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    regionID INT NOT NULL,
    FOREIGN KEY (regionID) REFERENCES Region(ID) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Municipio (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    distritoID INT NOT NULL,
    FOREIGN KEY (distritoID) REFERENCES Distrito(ID) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE HechosRecientes (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE Municipio_HechosRecientes (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    municipioID INT NOT NULL,
    hechosRecientesID INT NOT NULL,
    FOREIGN KEY (municipioID) REFERENCES Municipio(ID) ON DELETE CASCADE,
    FOREIGN KEY (hechosRecientesID) REFERENCES HechosRecientes(ID) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE PuntosCardinales (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO PuntosCardinales (nombre)
VALUES 
    ('Norte'),
    ('Sur'),
    ('Este'),
    ('Oeste'),
    ('Noreste'),
    ('Noroeste'),
    ('Sureste'),
    ('Suroeste');

CREATE TABLE MunicipioColindante (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    municipioID INT NOT NULL,
    colindanteID INT NOT NULL,
    puntoCardinalID INT NOT NULL,
    FOREIGN KEY (municipioID) REFERENCES Municipio(ID) ON DELETE CASCADE,
    FOREIGN KEY (colindanteID) REFERENCES Municipio(ID) ON DELETE CASCADE,
    FOREIGN KEY (puntoCardinalID) REFERENCES PuntosCardinales(ID),
    CONSTRAINT unico_colindancia UNIQUE (municipioID, colindanteID)
) ENGINE=InnoDB;


CREATE TRIGGER evitar_autorreferencia
BEFORE INSERT ON MunicipioColindante
FOR EACH ROW
BEGIN
    IF NEW.municipioID = NEW.colindanteID THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Un municipio no puede ser colindante consigo mismo.';
    END IF;
END

--Nuevas tablas
CREATE TABLE GrupoCriminal (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE Municipio_GrupoCriminal (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    municipioID INT NOT NULL,
    grupoCriminalID INT NOT NULL,
    FOREIGN KEY (municipioID) REFERENCES Municipio(ID) ON DELETE CASCADE,
    FOREIGN KEY (grupoCriminalID) REFERENCES GrupoCriminal(ID) ON DELETE CASCADE,
    CONSTRAINT unico_grupo_criminal UNIQUE (municipioID, grupoCriminalID)
) ENGINE=InnoDB;

CREATE TABLE Localidad (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    municipioID INT NOT NULL,
    FOREIGN KEY (municipioID) REFERENCES Municipio(ID) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE SectorActividadEconomica (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE ActividadEconomica (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    sectorActividadEconomicaID INT NOT NULL,
    FOREIGN KEY (sectorActividadEconomicaID) REFERENCES SectorActividadEconomica(ID) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Actividad_Economica_Municipio (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    municipioID INT NOT NULL,
    actividadEconomicaID INT NOT NULL,
    FOREIGN KEY (municipioID) REFERENCES Municipio(ID) ON DELETE CASCADE,
    FOREIGN KEY (actividadEconomicaID) REFERENCES ActividadEconomica(ID) ON DELETE CASCADE,
    CONSTRAINT unico_actividad_economica UNIQUE (municipioID, actividadEconomicaID)
) ENGINE=InnoDB;
