import accountRequestBody from '../../data/user/create_account.json' with { type: 'json' }    //Some node versions work with "with", older ones might require "assert"
import { generateRandomEmail, generateRandomPassword, generateRandomFirstName, generateRandomLastName } from '../helpers.js'

export async function getCreateUserRequestBody() {
    accountRequestBody.name = await generateRandomFirstName()
    accountRequestBody.surname = await generateRandomLastName()
    let password = await generateRandomPassword()
    accountRequestBody.password = password
    global.executionVariables.password = password
    accountRequestBody.email = await generateRandomEmail()
    return accountRequestBody
}

export async function getUpdateUserRequestBody() {
    //accountRequestBody.name = `${config[global.env].username}Updated`
    //accountRequestBody.status = config[global.env].status
    //accountRequestBody.gender = config[global.env].gender
    //accountRequestBody.email = await generateRandomEmail()
    
    return accountRequestBody
}