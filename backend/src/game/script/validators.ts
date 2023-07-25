export function validateDifficulty(value : string ) : boolean
{
    if (value != "default" && value != "easy" && value != "medium" && value != "hard")
    {
        return false
    }
    else
    {
        return true
    }
}

export function validateColor(value : string) : boolean
{
    if (value !=  "default" && value != "green" && value != "red" && value != "black")
    {
        return false
    }
    else
    {
        return true
    }
}