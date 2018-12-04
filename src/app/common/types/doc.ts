export interface Doc {
    _id: string,
    name: string,
    version: string,
    importSchema: string,
    sourceTable: string,
    destTableQueries: Array<any>
}
