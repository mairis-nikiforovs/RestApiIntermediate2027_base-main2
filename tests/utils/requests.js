import addContext from 'mochawesome/addContext.js'
import supertest from 'supertest'
import { config } from '../../config.js'
import { expect, assert } from 'chai'
import getNestedValue from 'get-nested-value'
import Ajv from 'ajv'

export async function request(context, method, path, requestBody = undefined, auth = true, assertions = {statusCode : 200},  host = undefined, customHeaders = undefined) {
    const client = host ? supertest(host) : supertest(config[global.env].host)

    const headers = customHeaders ? customHeaders : {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': `${config[global.env].token}`,
        ...(auth && {'Authorization': `Bearer ${global.executionVariables.userToken}`}) //spread operator to conditionally add the Authorization header if auth is true
    }

    let response = null
    let responseBody
    switch (method) {
        case 'GET':
            response = await client.get(path).set(headers)
            responseBody = response.body
            await runAssertions(responseBody, assertions, context, method, path, headers, response)
            break
        case 'POST':
            response = await client.post(path).send(requestBody).set(headers)
            responseBody = response.body
            await runAssertions(responseBody, assertions, context, method, path, headers, response, requestBody)
            break
        case 'PATCH':
            response = await client.patch(path).send(requestBody).set(headers)
            responseBody = response.body
            await runAssertions(responseBody, assertions, context, method, path, headers, response, requestBody)
            break
        case 'DELETE':
            response = await client.delete(path).send(requestBody).set(headers)
            responseBody = response.body
            await runAssertions(responseBody, assertions, context, method, path, headers, response, requestBody)
            break
        case 'PUT':
            response = await client.put(path).send(requestBody).set(headers)
            responseBody = response.body
            await runAssertions(responseBody, assertions, context, method, path, headers, response, requestBody)
            break
        default:
            console.log('not valid request method provided')
    }
    addRequestInfoToReport(context, method, path, headers, response, requestBody)
    return response
}

async function runAssertions(responseBody, assertions, context, method, path, headers, response, requestBody) {
    await validateStatusCode(response.statusCode, assertions.statusCode, context, method, path, headers, response, requestBody)

    if (assertions.expectedFields) {
        await validateFieldsExists(responseBody, assertions.expectedFields, context, method, path, headers, response, requestBody)
    }

    if (assertions.expectedValues) {
        await validateExpectedValues(responseBody, assertions.expectedValues, context, method, path, headers, response, requestBody)
    }

    if (assertions.validateValueInArray) {
        await validateValueInArray(responseBody, assertions.validateValueInArray, context, method, path, headers, response, requestBody)
    }

    if (assertions.expectedType) {
        await validateExpectedType(responseBody, assertions.expectedType, context, method, path, headers, response, requestBody)
    }

    if (assertions.assertSchema){
        await validateSchema(responseBody, assertions.assertSchema)
    }

    if (assertions.executionVariables) {
        await setExecutionVariables(responseBody, assertions.executionVariables)
    }
}

async function validateStatusCode(actual, expected, context, method, path, headers, response, requestBody) {
    try {
        expect(actual).to.be.equal(expected)
    } catch(error) {
        addRequestInfoToReport(context, method, path, headers, response, requestBody)
        assert.fail(error.actual, error.expected, `Actual is ${error.actual}, but expected was ${error.expected}`)
    }
}

async function validateFieldsExists(body, fields, context, method, path, headers, response, requestBody) {
    fields.forEach(field => {
        try {
            expect(getNestedValue(field, body), `${field} present in body`).not.to.be.undefined
        } catch (error) {
            addRequestInfoToReport(context, method, path, headers, response, requestBody)
            assert.fail(error.actual, error.expected, `${field} field is not present in body`)
        }
    })
}

async function validateSchema(responseBody, schema){
    const ajv = new Ajv()
    const validate = ajv.compile(schema)
    const isValid = validate(responseBody)
    if (!isValid) {
        assert.fail("The schema assertion failed!")
    }
}

// {"key": "value"} -> does the assertion / checks info
async function validateExpectedValues(body, fields, context, method, path, headers, response, requestBody) {
    fields.forEach(field => {
        try {
            expect(getNestedValue(field.path, body), `${field.path} not equal to ${field.value}`).to.be.equal(field.value)
        } catch (error) {
            addRequestInfoToReport(context, method, path, headers, response, requestBody)
            const actual = getNestedValue(field.path, body)
            assert.fail(actual, field.value, `${field.path} expected value is ${field.value}, but actual was ${actual}`)
        }
    })
}

// [{"key": "value"}, {"key": "value"}] -> {"key": "value"}
async function validateValueInArray(body, obj, context, method, path, headers, response, requestBody) {
    let target = body.find(item => item[obj.key] === obj.value)
    await validateExpectedValues(target, obj.fields, context, method, path, headers, response, requestBody)
}

async function validateExpectedType(body, fields, context, method, path, headers, response, requestBody) {
    fields.forEach(field => {
        try {
            switch (field.type){
                case 'string':
                    expect(getNestedValue(field.path, body), `${field.path} not equal to ${field.type}`).to.be.a("string")
                    break
                case 'number':
                    expect(getNestedValue(field.path, body), `${field.path} not equal to ${field.type}`).to.be.a("number")
                    break
                case 'boolean':
                    expect(getNestedValue(field.path, body), `${field.path} not equal to ${field.type}`).to.be.a("boolean")
                    break
                case 'object':
                    expect(getNestedValue(field.path, body), `${field.path} not equal to ${field.type}`).to.be.an("object")
                    break
                case 'array':
                    expect(getNestedValue(field.path, body), `${field.path} not equal to ${field.type}`).to.be.an("array")
                    break
                default:
                    console.log("AN INVALID DATA TYPE WAS PROVIDED FOR ASSERTION")

            }
        } catch (error) {
            addRequestInfoToReport(context, method, path, headers, response, requestBody)
            const actual = getNestedValue(field.path, body)
            assert.fail(actual, field.type, `${field.path} expected value is ${field.type}, but actual was ${typeof actual}`)
        }
    })
}

async function setExecutionVariables(body, variables) {
    variables.forEach(variable => {
        global.executionVariables[variable.name] = getNestedValue(variable.path, body)
    })
}

function addRequestInfoToReport(context, method, path, headers, response, body) {
    if (context) {
        addContext(context, `${method} ${path}`)
        addContext(context, {
            title: 'REQUEST HEADERS',
            value: headers
        })
        if (body) {
            addContext(context, {
                title: 'REQUEST BODY',
                value: body
            })
        }
        addContext(context, {
            title: 'RESPONSE HEADERS',
            value: response.headers
        })
        addContext(context, {
            title: 'RESPONSE BODY',
            value: response.body
        })
        addContext(context, {
            title: "TEST LOG",
            value: "Some random text that needs to be logged"
        })
    }
}
