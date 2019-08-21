const shoppingListService = require('../src/shopping-list-service')
const knex = require('knex')

describe(`shoppingList Service object`, function() {
    let db

    let testItems = [
        {
            id: 1,
            name: 'big \'ol box of cereal',
            price: '10.99',
            date_added: new Date('2100-05-22T16:28:32.615Z'),
            checked: false,
            category: 'breakfast',
        },
        {
            id: 2,
            name: 'cheap steak',
            price: '11.99',
            date_added: new Date('1919-12-22T16:28:32.615Z'),
            checked: false,
            category: 'main'
        },
        {
            id: 3,
            name: 'expensive fish',
            price: '2399.99',
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            checked: false,
            category: 'lunch'
        },
    ]

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.DB_URL,
        })
    })

    after(() => db.destroy())

    before(() => db('shopping_list').truncate())

    afterEach(() => db('shopping_list').truncate())

    context(`Given 'shopping_list' has data`, () => {
       beforeEach(() => {
            return db
                .insert(testItems)
                .into('shopping_list')
        })

        it(`getAllItems() resolves all shoppinglist items from 'shopping_list' table`, () => {
            return shoppingListService.getAllItems(db)
                .then(actual => {
                    expect(actual).to.eql(testItems)
                })
        })

        it(`getById() resolves an Item by id from 'shopping_list' table`, () => {
            const thirdId = 3
            const thirdTestItem = testItems[thirdId - 1]
            return shoppingListService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        name: thirdTestItem.name,
                        price: thirdTestItem.price,
                        date_added: thirdTestItem.date_added,
                        checked: thirdTestItem.checked,
                        category: thirdTestItem.category,
                    })
                })
        })

        it(`deleteItem() removes an item by id from 'shopping_list' table`, () => {
            const itemId = 2
            return shoppingListService.deleteItem(db, itemId)
                .then(() => shoppingListService.getAllItems(db))
                .then(allItems => {
                    const expected = testItems.filter(item => item.id !== itemId)
                    expect(allItems).to.eql(expected)
                })
        })

        it(`updateItem() updates an item by id from 'shopping_list' table`, () => {
            const idOfItemToUpdate = 3
            const newItemData = {
                name: 'updated name',
                price: '1.01',
                date_added: new Date(),
                checked: true,
                category: 'breakfast',
            }
            return shoppingListService.updateItem(db, idOfItemToUpdate, newItemData)
                .then(() => shoppingListService.getById(db, idOfItemToUpdate))
                .then(article => {
                    expect(article).to.eql({
                        id: idOfItemToUpdate,
                        ...newItemData,
                    })
                })
        })
    })

    context(`given 'shopping_list' has no data`, () => {
        it(`getAllItems() resolves and empty array`, () => {
            return shoppingListService.getAllItems(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })
    })

    it(`insertItem() inserts a new item to 'shopping_list' table`, () => {
        const newItem = {
            name: 'inserted new name',
            price: '11.11',
            date_added: new Date(),
            checked: false,
            category: 'breakfast',
        }
        return shoppingListService.insertItem(db, newItem)
            .then(actual => {
                expect(actual).to.eql({
                    id: 1,
                    name: newItem.name,
                    price: newItem.price,
                    date_added: newItem.date_added,
                    checked: newItem.checked,
                    category: newItem.category,
                })
            })
    })
})