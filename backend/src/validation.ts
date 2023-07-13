export function validateName (value: string): boolean
{
    if (value == undefined)
        return false;

    if (value.length < 1)
        return false;
    if (value.length > 100)
        return false;

    for (const c of value)
    {
        if ((c < '0' || c > '9')
            && (c < 'A' || c > 'Z')
            && (c < 'a' || c > 'z')
            && c != '_')
            return false;
    }

    return true;
}

export function validatePassword (value: string): boolean
{
    if (value == undefined)
        return true;

    if (value.length < 8)
        return false;

    let numbers = 0;
    let lowercaseLetters = 0;
    let uppercaseLetters = 0;
    let symbols = 0;

    for (const c of value)
    {
        if (c >= '0' && c <= '9')
            numbers += 1;
        else if (c >= 'A' && c <= 'Z')
            uppercaseLetters += 1;
        else if (c >= 'a' && c <= 'z')
            lowercaseLetters += 1;
        else
            symbols += 1;
    }

    return numbers > 0 && lowercaseLetters > 0 && uppercaseLetters > 0 && symbols > 0;
}

export function validatePngFilename (value: string): boolean
{
    if (value == undefined)
        return false;

    const ext = value.split (".").pop ().split("?")[0];

    return ext.toLowerCase () == "png";
}
