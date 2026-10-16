import { request } from '../../utils/requests.js'
import { getCreateUserRequestBody, getUpdateUserRequestBody } from '../../utils/requestBodyGenerator/customer.js'
import { config } from '../../../config.js'

export async function createUser() {
    it('Create user account', async function () {
        const requestBody = await getCreateUserRequestBody()
        await request(this, 'POST', '/user', requestBody, false, 
            {
                statusCode : 201,
                expectedValues: [
                                    {path: 'name', value: requestBody.name},
                                    {path: 'surname', value: requestBody.surname},
                                    {path: 'email', value: requestBody.email}
                                ],
                executionVariables: [
                                        {path: 'email', name: 'userEmail'}, 
                                    ]
            }
        )
    })
}

export async function logIn() {
    it('Log in user account', async function () {
        const requestBody = {
            email: global.executionVariables.userEmail,
            password: global.executionVariables.password
        }
        await request(this, 'POST', '/login', requestBody, false,
            {
                statusCode: 200,
                expectedValues: [
                    {path: 'message', value: 'Login successful'}
                ],
                executionVariables: [
                    {path: 'token', name: 'userToken'}
                ]
            }
        )
    })
}

export async function deleteUser() {
    it('Remove user account', async function () {
        await deleteUserWithNoWrapper();
    })
}

export async function deleteUserWithNoWrapper() {
    await request(this, 'DELETE', `/user`, undefined, true, 
        {
            statusCode : 200
        }
    )
}

export async function createUserWithNoEmail() {
    it('Create user with no email', async function () {
        const requestBody = await getCreateUserRequestBody()
        delete requestBody.email
        await request(this, 'POST', '/user', requestBody, false, 
            {
                statusCode : 400,
                expectedValues: [
                                    {path: 'message', value: "User validation failed: email: Path `email` is required."}
                                ]
            }
        )
    })
}

export async function createUserWithNoPassword() {
    it('Create user with no password', async function () {
        const requestBody = await getCreateUserRequestBody()
        delete requestBody.password
        await request(this, 'POST', '/user', requestBody, false, 
            {
                statusCode : 400,
                expectedValues: [
                                    {path: 'message', value: "Password not provided"}
                                ]
            }
        )
    })
}

export async function createUserWithNoParam(param) {
    it('Create user with no param', async function () {
        switch(param) {
            case 'email':
                createUserWithNoEmail()
                break
            case 'password':
                createUserWithNoPassword()
                break
        }
    })
}