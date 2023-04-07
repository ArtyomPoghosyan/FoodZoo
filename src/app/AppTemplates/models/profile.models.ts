export interface USER {
authToken: string
cartIsChanged: boolean
error: number
isNew: boolean
message: string
profile: Profile

}

export interface Profile {
    birthDate: string|null
    card: string|null
    cartAmount: number
    deliveryAddress: string|null
    email: string
    id: number
    isEmailEnabled: number
    isPushEnabled: number
    isRecallEnabled: number
    minOrderSum: number
    minOrderSumDlvry: number
    name: string
    phone: string
    position: {
        latitude: number, 
        longitude: number
    }
    regionName: string
    shownAddress: string
    storeChoice: number
}