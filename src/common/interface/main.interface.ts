export interface AppErr {
    readonly message: string
    readonly status: number
    readonly data?: object
    readonly location?: string 
}



export interface JwtPayloadI {
    readonly userId: string
}