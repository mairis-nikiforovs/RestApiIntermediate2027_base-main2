import { createUser, deleteUserWithNoWrapper, logIn } from '../../steps/user/user.js'
import { createRestaurant, deleteRestaurant, getRestaurant, updateRestaurant, getAlreadyDeletedRestaurant, deleteAlreadyDeletedRestaurant, getAllRestaurants, negativeCreateRestaurant } from '../../steps/restaurants/restaurant.js'
import { generateTestData, readCsvFile } from '../../utils/helpers.js'
import negativeScenarios from '../../data/restaurants/negative_restaurant.json' with {type: 'json'}

before(async () => {
    await generateTestData()
    createUser()
    logIn()
})

after(async () => {
    deleteUserWithNoWrapper()
})


it('Restaurant Tests', async () => {
    describe(`CRUD Restaurant positive`, () => {
        createRestaurant()
        getRestaurant()
        updateRestaurant()
        getRestaurant()
        deleteRestaurant()
        getAlreadyDeletedRestaurant()
    })

    describe(`Negative - Deleting an already deleted restaurant`, () => {
        createRestaurant()
        deleteRestaurant()
        deleteAlreadyDeletedRestaurant()
    })

    describe(`Get all restaurants for a single user`, () => {
        createRestaurant()
        createRestaurant()
        getAllRestaurants()
    })

    describe(`Negative - create restaurants from json`, () => {
        for(let scenario of negativeScenarios){
            negativeCreateRestaurant(
                scenario.requestBody, 
                scenario.testCaseName,
                scenario.expectedStatusCode,
                scenario.expectedMessage
            )
        }
    })

    var requestBodies = await readCsvFile('tests/data/restaurants/data.csv');
    for ( let body of requestBodies){
        describe('Create restaurant with data from CSV file', () => {
            createRestaurant(body)
        })
    }

})

