import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

export function IsName (validationOptions?: ValidationOptions)
{
    return (object: any, propertyName: string) => {
        registerDecorator ({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsNameConstraint,
        });
    };
}

@ValidatorConstraint ({name: "IsName"})
export class IsNameConstraint implements ValidatorConstraintInterface
{
    validate (value: string, args: ValidationArguments): boolean
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
}
