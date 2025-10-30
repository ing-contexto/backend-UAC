interface RecentEvent {
    id: number;
    titulo: string;
    fecha: Date;
    descripcion: string;
    conflictividad: { id: number; tipo?: string };
    link: string;
    municipios?: number[];
}