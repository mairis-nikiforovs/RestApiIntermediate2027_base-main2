import restaurantRequestBody from '../../data/restaurants/create_restaurant.json' with { type: 'json' }    //Some node versions work with "with", older ones might require "assert"
import { generateRandomRestaurantName, generateRandomRestaurantDescription } from '../helpers.js'

export async function getCreateRestaurantBody() {
    restaurantRequestBody.name = await generateRandomRestaurantName()
    restaurantRequestBody.description = await generateRandomRestaurantDescription()
    return restaurantRequestBody
}