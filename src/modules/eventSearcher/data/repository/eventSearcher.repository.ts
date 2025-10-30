import EventSearcherDatasource from "../datasource/eventSearcher.datasource";

export default class EventSearcherRepository {
    private datasource: EventSearcherDatasource;

    constructor(datasource: EventSearcherDatasource) {
        this.datasource = datasource;
    }

    async searchRecentEvents(keyword: string): Promise<RecentEvent[]> {
        return this.datasource.searchRecentEvents(keyword);
    }
}