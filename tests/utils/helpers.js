import { faker } from '@faker-js/faker'
import csv from 'csv-parser'
import fs from 'fs'

export async function generateTestData() {
    global.env = process.env.ENV || 'STG'
    console.log(process.env.ENV)

}

export async function generateRandomEmail() {
    return faker.internet.email({ provider: 'apimail.tdlbox.com' })
}

export async function generateRandomPassword() {
    return faker.internet.password({ length: 9 })
}

export async function generateRandomFirstName() {
    return faker.person.firstName()
}

export async function generateRandomLastName() {
    return faker.person.lastName()
}

export async function generateRandomRestaurantName() {
    return `${faker.company.name()} ${Date.now()}`
}

export async function generateRandomRestaurantDescription() {
    return faker.lorem.sentence()
}

export async function readCsvFile(filePath){
    return new Promise((resolve,reject) => {
        var result = []

        fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => result.push(data))
        .on('end', () => resolve(result))
        .on('error', (err) => reject(err))
    }) 
}

