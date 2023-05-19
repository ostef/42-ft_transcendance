import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

export function IsPassword (validationOptions?: ValidationOptions)
{
    return (object: any, propertyName: string) => {
        registerDecorator ({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsPasswordConstraint,
        });
    };
}

@ValidatorConstraint ({name: "IsPassword"})
export class IsPasswordConstraint implements ValidatorConstraintInterface
{
    validate (value: string, args: ValidationArguments): boolean
    {
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
}
