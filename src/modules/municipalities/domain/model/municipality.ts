export default interface Municipality {
  id: number;
  nombre: string;
  distrito: string;
  region: string;
  colindantes?: string[] | string;
}
