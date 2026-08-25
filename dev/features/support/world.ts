import { setWorldConstructor, World } from '@cucumber/cucumber'

class FoodlogWorld extends World {
  constructor(options) {
    super(options)
    this.page = null
    this.baseUrl = null
  }
}

setWorldConstructor(FoodlogWorld)
