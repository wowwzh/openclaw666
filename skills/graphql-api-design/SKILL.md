# GraphQL API设计技能

完整的GraphQL API设计与实现指南。

## 核心概念

GraphQL是一种用于API的查询语言，由Facebook开发。相比REST，它提供了更高效、更强大、更灵活的API设计方式。

## Schema定义

### 基础类型

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  createdAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  comments: [Comment!]!
  published: Boolean!
  createdAt: DateTime!
}

type Comment {
  id: ID!
  text: String!
  author: User!
  post: Post!
}
```

### 查询类型

```graphql
type Query {
  # 获取单个
  user(id: ID!): User
  post(id: ID!): Post
  
  # 列表查询(支持分页)
  users(first: Int, after: String): UserConnection!
  posts(first: Int, after: String, published: Boolean): PostConnection!
  
  # 搜索
  search(query: String!): [SearchResult!]!
}

# 分页类型
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
}

type UserEdge {
  cursor: String!
  node: User!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### 变更类型

```graphql
type Mutation {
  # 创建
  createUser(input: CreateUserInput!): User!
  createPost(input: CreatePostInput!): Post!
  
  # 更新
  updateUser(id: ID!, input: UpdateUserInput!): User
  updatePost(id: ID!, input: UpdatePostInput!): Post
  
  # 删除
  deleteUser(id: ID!): Boolean!
  deletePost(id: ID!): Boolean!
}

input CreateUserInput {
  name: String!
  email: String!
}

input CreatePostInput {
  title: String!
  content: String!
  authorId: ID!
}
```

### 订阅类型(实时)

```graphql
type Subscription {
  # 实时通知
  postCreated: Post!
  postUpdated(id: ID!): Post!
  commentAdded(postId: ID!): Comment!
}
```

## Resolver实现

```javascript
const resolvers = {
  Query: {
    user: (_, { id }) => db.users.find(id),
    posts: (_, { first, published }) => db.posts.find({ 
      published: published ?? true 
    }).limit(first ?? 10),
  },
  
  Mutation: {
    createUser: async (_, { input }) => {
      const user = await db.users.create(input);
      return user;
    },
    deletePost: async (_, { id }) => {
      await db.posts.delete(id);
      return true;
    }
  },
  
  // 字段级Resolver
  User: {
    posts: (user) => db.posts.find({ authorId: user.id })
  },
  
  Post: {
    author: (post) => db.users.find(post.authorId),
    comments: (post) => db.comments.find({ postId: post.id })
  }
};
```

## 数据加载优化

### DataLoader批处理

```javascript
const DataLoader = require('dataloader');

const userLoader = new DataLoader(async (ids) => {
  // 批量查询数据库
  const users = await db.users.findMany({ id: ids });
  
  // 按原始顺序返回
  return ids.map(id => users.find(u => u.id === id));
});

// Resolver中使用
const resolvers = {
  Post: {
    author: ({ authorId }) => userLoader.load(authorId)
  }
};
```

### N+1问题解决

```graphql
# 问题: 每个post都会单独查询author
query {
  posts {
    title
    author { name }  # N+1 查询
  }
}

# 解决方案: 使用DataLoader批量加载
```

## 认证与授权

### 认证中间件

```javascript
const authMiddleware = (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new AuthError('No token provided');
  
  const user = jwt.verify(token);
  return user;
};

// Context
const context = ({ req }) => {
  return {
    user: authMiddleware(req),
    db: new Database()
  };
};
```

### 授权指令

```graphql
directive @auth on FIELD_DEFINITION

type User {
  email: String! @auth
  posts: [Post!]!
}

# 或者在resolver中
const resolvers = {
  User: {
    email: (user, _, ctx) => {
      if (ctx.user.id !== user.id) {
        throw new ForbiddenError('Access denied');
      }
      return user.email;
    }
  }
};
```

## 错误处理

```graphql
type Error {
  message: String!
  code: String!
  field: String
}

union Result = User | Error

type Mutation {
  createUser(input: CreateUserInput!): Result!
}
```

```javascript
const createUser = async (_, { input }) => {
  try {
    const user = await db.users.create(input);
    return user;
  } catch (error) {
    return {
      message: error.message,
      code: 'VALIDATION_ERROR',
      field: 'email'
    };
  }
};
```

## 性能优化

### 查询复杂度限制

```javascript
const complexity = {
  users: (args, context) => args.first || 10,
  posts: (args) => (args.first || 10) * 2
};
```

### 缓存策略

```javascript
const cache = new Map();

const resolvers = {
  Query: {
    user: async (_, { id }, context, info) => {
      const cacheKey = `user:${id}`;
      
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }
      
      const user = await db.users.find(id);
      cache.set(cacheKey, user);
      
      return user;
    }
  }
};
```

## 工具链

| 工具 | 用途 |
|------|------|
| Apollo Server | GraphQL服务器 |
| Apollo Client | GraphQL客户端 |
| GraphQL Playground | API测试工具 |
| Prisma | 数据库ORM |
| GraphQL Shield | 权限控制 |

## 最佳实践

1. **使用Named Queries** - 避免查询冲突
2. **Connection分页** - 支持大规模数据
3. **DataLoader** - 解决N+1问题
4. **Input Validation** - 严格验证输入
5. **Error Handling** - 友好的错误信息
6. **Caching** - 合理使用缓存
7. **Authorization** - 细粒度权限控制
