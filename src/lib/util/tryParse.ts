export function TryParseInt(str: string, defaultValue: number | undefined) {
    if(str !== null) {
        if(str.length > 0) {
            const number = parseInt(str)
            if (!isNaN(number)){
                return number
            }
        }
    }
    return defaultValue;
}
