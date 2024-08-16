import { faker } from '@faker-js/faker';

export const generateProduct = () => {
    let producto = {
        title: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        price: parseFloat(faker.commerce.price()),
        thumbnail: faker.image.url(),
        code: faker.string.uuid(),
        stock: faker.number.int({ min: 1, max: 100 }),
        category: faker.commerce.department(),
        status: faker.datatype.boolean()
    }
    return producto;
}

