import { createUser, deleteUser, logIn, createUserWithNoEmail, createUserWithNoPassword, createUserWithNoParam } from '../../steps/user/user.js'
import { generateTestData } from '../../utils/helpers.js'

before(async () => {
    await generateTestData()
})

it('User Tests', () => {
    describe(`CRUD User positive`, () => {
        createUser()
        logIn()
        deleteUser()
    })

    describe(`Negative - Create account without email`, () => {
        createUserWithNoParam("email")
    })

    describe(`Negative - Create account without password`, () => {
        createUserWithNoParam("password")
    })
})

