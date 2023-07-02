# graphql-generator-from-entity-definitions

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/HiromiShikata/graphql-generator-from-entity-definitions/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/HiromiShikata/graphql-generator-from-entity-definitions/tree/main)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

🥳 Welcome to **graphql-generator-from-entity-definitions**! This is a friendly command-line tool that helps you automate the creation of your GraphQL definitions. We hope to make your development experience more enjoyable and efficient!

## 🚀 Purpose

In the context of Domain-Driven Development, we perform domain analysis during software development and determine the entities in advance. The interface of GraphQL should ideally have a structure that is statically determined from the domain entities.

This CLI tool, created with npm, automates the tedious task of GraphQL definitions and contributes to advancing development under simple rules. If you want to prepare an interface that is not statically determined from the domain entities in GraphQL, please use the GraphQL schema file merge tool.

🎉 Isn't that fantastic? Let's dive in!

## 🛠️ How to use

Here is how to use the tool:

```bash
npx graphql-generator-from-entity-definitions /path/to/domain/entity/dir -o /path/to/schema.graphql
```

## 🎛️ Options

Our command-line tool provides several options to fine-tune your GraphQL schema generation. Let's dive into the details:

### --ignorePropertyNamesForCreation and --ignorePropertyNamesForUpdate

These options allow you to specify certain property names that should be ignored during the creation (`--ignorePropertyNamesForCreation`) or update (`--ignorePropertyNamesForUpdate`) operations in your GraphQL schema.

```bash
--ignorePropertyNamesForCreation [propertyNames]
--ignorePropertyNamesForUpdate [propertyNames]
```

These options can be extremely useful when dealing with fields that should not be manually set or modified. For instance, fields like `id`, `createdAt`, `updatedAt`, `createdUserId`, `updatedUserId` are often auto-generated by your backend during object creation and should not be updated manually.

By using these options, you can prevent these fields from being included in the GraphQL mutation inputs for creation and update operations, making your schema more accurate and less prone to errors.

Provide the names of these properties as comma-separated values. For example:

```bash
--ignorePropertyNamesForCreation id,createdAt,updatedAt,createdUserId,updatedUserId
--ignorePropertyNamesForUpdate createdAt,createdUserId
```

With these options, you have the flexibility to customize the generated GraphQL schema to match your domain entities' unique needs perfectly.

## e2e Testing

We have comprehensive e2e testing to make sure that the command-line tool works perfectly. The tests ensure that the tool outputs the correct GraphQL schema and handles errors correctly. You can check out the test file for more details.

## 🚧 Limitation

- Domain entity should be defined using `type`.

## 📜 License

**graphql-generator-from-entity-definitions** is licensed under the [MIT License](LICENSE). This means that you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the conditions outlined in the MIT License.

## ❓ Issues and Contributions

I'm passionate about improving **graphql-generator-from-entity-definitions**, and I'm eager to understand your experiences with the tool. However, please keep in mind that this project is not my full-time job. But don't worry, I'm still very excited to see your suggestions for improvements!

### Reporting Issues

If you encounter any issues or have a feature request, please open an issue on our GitHub page. I'm keen to hear your feedback and I'll do my best to address the problem as soon as possible.

### Pull Requests

Contributions to the project are very welcome! 🎉 If you've fixed a bug or implemented a new feature that you think would improve the tool, feel free to make a pull request.

One thing I strongly believe in is that manual testing is a tedious chore - and I don't want you to do it either! So, instead of testing your changes manually, please include automated tests with your pull request. These tests help to ensure that the changes don't break any existing functionality and they make the review process much quicker and smoother.

Before making a pull request, please take a look at our [CONTRIBUTING.md](CONTRIBUTING.md) for the guidelines and steps to contribute to the project.

Let's enhance **graphql-generator-from-entity-definitions** together! 🚀

## 🙌 Conclusion

Our main aim is to make software development a less daunting process, helping you focus on what truly matters - solving problems and creating value! Enjoy using graphql-generator-from-entity-definitions, and may your development journey be a smooth and enjoyable one! 🎉

Thank you, and happy coding! 🚀
