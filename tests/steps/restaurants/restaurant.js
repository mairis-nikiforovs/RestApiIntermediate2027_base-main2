import { request } from '../../utils/requests.js'
import { getCreateRestaurantBody } from '../../utils/requestBodyGenerator/restaurant.js'
import schemaFile from '../../data/restaurants/schema.json' with {type: 'json'}

export async function createRestaurant(body = undefined) {
    it('Create a new Restaurant', async function () {
        const requestBody = body || await getCreateRestaurantBody()
        await request(this, 'POST', '/restaurants', requestBody, true, 
            {
                statusCode : 201,
                assertSchema: schemaFile,
                expectedFields: ["meals", "created"],
                expectedValues: [
                                    {path: 'name', value: requestBody.name},
                                    {path: 'description', value: requestBody.description}
                                ],
                expectedType: [
                                    {path: 'user', type: 'string'},
                                    {path: '_id', type: 'string'}     
                                ],
                executionVariables: [
                                        {path: 'name', name: 'restaurantName'},
                                        {path: 'description', name: 'restaurantDescription'},
                                        {path: 'user', name: 'userId'},
                                        {path: '_id', name: 'restaurantId'}
                                    ]
            }
        )
    })
}

export async function deleteRestaurant() {
    it('Delete a new Restaurant', async function () {
        await request(this, 'DELETE', `/restaurants/${global.executionVariables.restaurantId}`, undefined, true, 
            {
                statusCode : 200,
                expectedValues: [
                                    {path: 'message', value: "Restaurant removed"}
                                ]
            }
        )
    })
}

export async function updateRestaurant() {
    it('Update restaurant information', async function () {
        const requestBody = await getCreateRestaurantBody()
        await request(this, 'PATCH', `/restaurants/${global.executionVariables.restaurantId}`, requestBody, true,
            {
                statusCode: 200,
                expectedFields: ['meals', 'created'],
                expectedValues: [
                    {path: 'name', value: requestBody.name},
                    {path: 'description', value: requestBody.description},
                    {path: '_id', value: global.executionVariables.restaurantId},
                    {path: 'user', value: global.executionVariables.userId}
                ],
                executionVariables: [
                    {path: 'name', name: 'restaurantName'},
                    {path: 'description', name: 'restaurantDescription'}
                ]
            }
        )
    })
}

export async function getRestaurant() {
    it('Get restaurant information', async function () {
        await request(this, 'GET', `/restaurants/${global.executionVariables.restaurantId}`, undefined, true,
            {
                statusCode: 200,
                expectedFields: ['meals', 'created'],
                expectedValues: [
                    {path: 'name', value: global.executionVariables.restaurantName},
                    {path: 'description', value: global.executionVariables.restaurantDescription},
                    {path: '_id', value: global.executionVariables.restaurantId},
                    {path: 'user', value: global.executionVariables.userId}
                ]
            }
        )
    })
}

export async function getAllRestaurants() {
    it('Get all restaurants for a single user', async function () {
        await request(this, 'GET', `/restaurants`, undefined, true,
            {
                statusCode: 200,
                validateValueInArray: {
                    key: "_id",
                    value: global.executionVariables.restaurantId,
                    fields: [
                        {path: "name", value: global.executionVariables.restaurantName},
                        {path: "description", value: global.executionVariables.restaurantDescription}
                    ]
                }
            }
        )
    })
}

export async function getAlreadyDeletedRestaurant() {
    it('Get already deleted restaurant information', async function () {
        await request(this, 'GET', `/restaurants/${global.executionVariables.restaurantId}`, undefined, true,
            {
                statusCode: 404,
                expectedValues: [
                    {path: 'message', value: "Cannot find restaurant"},
                ]
            }
        )
    })
}

export async function deleteAlreadyDeletedRestaurant() {
    it('Delete an already deleted Restaurant', async function () {
        await request(this, 'DELETE', `/restaurants/${global.executionVariables.restaurantId}`, undefined, true, 
            {
                statusCode : 404,
                expectedValues: [
                                    {path: 'message', value: "Cannot find restaurant"}
                                ]
            }
        )
    })
}

export async function negativeCreateRestaurant(requestBody, testCaseName, expectedStatusCode, expectedMessage) {
    it(testCaseName, async function () {
        await request(this, 'POST', '/restaurants', requestBody, true, 
            {
                statusCode : expectedStatusCode,
                expectedValues: [
                                    {path: 'message', value: expectedMessage},
                                ]
            }
        )
    })
}