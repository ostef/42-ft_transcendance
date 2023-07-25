import { ValidationArguments, ValidationOptions, registerDecorator } from "class-validator";

export function isName (value: string): boolean
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

export function isPassword (value: string): boolean
{
    if (value == undefined)
        return false;

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

export function isPngFilename (value: string): boolean
{
    if (value == undefined)
        return false;

    const ext = value.split (".").pop ();
    if (!ext)
        return false;

    return ext.toLowerCase () == "png";
}

export function IsName (opts?: ValidationOptions)
{
    return function (obj: Object, propName: string)
    {
        registerDecorator ({
            name: "isName",
            target: obj.constructor,
            propertyName: propName,
            constraints: [],
            options: opts,
            validator: {
                validate (value: any, args: ValidationArguments): boolean
                {
                    if (typeof value !== "string")
                        return false;

                    return isName (value as string);
                }
            },
        });
    };
}

export function IsPngFilename (opts?: ValidationOptions)
{
    return function (obj: Object, propName: string)
    {
        registerDecorator ({
            name: "isPngFilename",
            target: obj.constructor,
            propertyName: propName,
            constraints: [],
            options: opts,
            validator: {
                validate (value: any, args: ValidationArguments): boolean
                {
                    if (typeof value !== "string")
                        return false;

                    return isPngFilename (value as string);
                }
            },
        });
    };
}
