export function normalizeEmail(email: string) {

    // Convert email to lowercase
    const normalizedEmail: string = email.toLowerCase();


    /** to remove dots: hameed.bab@gmail.com **/
    const splitted = normalizedEmail.split('@')
    // pick the last part
    const domain = splitted.slice(-1)

    splitted.pop()

    let identifier: string = splitted.join('').split('.').join('')

    // check for + sign
    identifier = identifier.split('+')[0] + "@" + domain

    return identifier
}