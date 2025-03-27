export enum CategoryEnum { }

interface RangeI {
    lte?: number
    gte?: number
}

export interface FetchProductI {
    readonly page?:number
    readonly limit?:number
    readonly categoryFilter?:CategoryEnum
    readonly search?:string
    readonly priceFilter?: RangeI
    readonly dateFilter?: RangeI
}