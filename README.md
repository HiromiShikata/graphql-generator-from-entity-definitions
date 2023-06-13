# graphql-generator-from-entity-definitions

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/HiromiShikata/graphql-generator-from-entity-definitions/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/HiromiShikata/graphql-generator-from-entity-definitions/tree/main)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

## Usage

```
npx graphql-generator-from-entity-definitions /path/to/domain/entity/dir -o /path/to/schema.graphql
```

## Limitation

- Domain entity should be defined using `type`