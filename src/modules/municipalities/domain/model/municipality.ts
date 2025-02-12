export default interface Municipality {
  clave: number;
  nombre: string;
  distrito: string;
  region: string;
  colindantes?: string[] | string;
}
