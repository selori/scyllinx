# Factories & Seeders

Factories and Seeders in ScyllinX provide a powerful way to generate test data and populate your database with sample records. Factories define how to create model instances with fake data, while seeders orchestrate the population of your database with realistic datasets.

## Introduction

### What are Factories?

Factories are classes that define how to generate fake data for your models. They use libraries like Faker.js to create realistic test data and provide a consistent way to create model instances for testing and development.

### What are Seeders?

Seeders are classes that use factories and direct database operations to populate your database with sample data. They're useful for:

- **Development**: Creating realistic data for local development
- **Testing**: Generating consistent test datasets
- **Demos**: Populating databases for demonstrations
- **Initial Data**: Setting up default application data

## Creating Factories

### Basic Factory Structure

```typescript
import { ModelFactory, faker } from 'scyllinx';
import { User } from '../models/User';
import { UserAttributes } from '@/types/index/models';

export class UserFactory extends ModelFactory<User, UserAttributes> {
  protected model = User;

  definition(): Partial<UserAttributes> {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'password123', // In real apps, hash this
      bio: faker.lorem.paragraph(),
      age: faker.number.int({ min: 18, max: 80 }),
      is_active: faker.datatype.
