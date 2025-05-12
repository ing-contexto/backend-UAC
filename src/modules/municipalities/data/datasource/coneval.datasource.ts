import ConevalData from "../../domain/model/conevalData";

export default class ConevalDatasource {
    private token: string | null = null;

    private async obtenerToken(): Promise<string> {
        const url = "https://sistemas.coneval.org.mx/SIID/api/V1/publico/pobreza/2020/0/20/1/2";
        const response = await fetch(url, {
            headers: {
                Email: "gerardoruizmendez012@gmail.com"
            }
        });

        if (!response.ok) {
            throw new Error("No se pudo obtener el token");
        }

        const token = await response.text();
        return token;
    }


    async getConevalData(munIds: number[]): Promise<ConevalData[]> {
        const urls = munIds.map(
            (clave) =>
                `https://sistemas.coneval.org.mx/SIID/api/V1/publico/pobreza/2020/0/20/${clave}/2`
        );

        const intentarFetch = async (): Promise<(ConevalData[] | null)[]> => {
            return Promise.all(
                urls.map(async (url) => {
                    try {
                        const response = await fetch(url, {
                            headers: {
                                Authorization: this.token || "",
                            },
                        });

                        if (response.status === 406 || response.status === 400) return null; // Señal de token vencido
                        if (!response.ok) throw new Error(`Error ${response.status} en ${url}`);

                        const data = await response.json();
                        return data;
                    } catch (err) {
                        console.error("Error individual:", err);
                        return null;
                    }
                })
            );
        };

        if (!this.token) {
            this.token = await this.obtenerToken();
        }

        let resultados = await intentarFetch();

        if (resultados.some((res) => res === null)) {
            this.token = await this.obtenerToken();
            resultados = await intentarFetch();
        }

        return resultados
            .filter((res): res is ConevalData[] => Array.isArray(res))
            .flat();
    }
}
