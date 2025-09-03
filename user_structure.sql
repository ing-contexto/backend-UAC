CREATE TABLE IF NOT EXISTS `Rol` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(100) NOT NULL,
    `Descripcion` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
/**/
CREATE TABLE IF NOT EXISTS `Usuario` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(100) NOT NULL,
    `Usuario` VARCHAR(100) NOT NULL,
    `Correo` VARCHAR(255) NOT NULL,
    `Password` VARCHAR(255) NOT NULL,
    `Rol_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_usuario_correo` (`Correo`),
    KEY `idx_usuario_rol_id` (`Rol_id`),
    CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`Rol_id`) REFERENCES `Rol`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
/**/
INSERT INTO `Rol` (`Nombre`, `Descripcion`)
VALUES (
        'Administrador',
        'Rol con permisos de administrador'
    ),
    ('Editor', 'Rol con permisos de editor'),
    (
        'Lector',
        'Rol con permisos solo de lectura'
    );