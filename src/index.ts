import { MikroORM } from '@mikro-orm/core'
import { __production__ } from './constants'
// import { Post } from './entities/post'
import mikroConfig from './mikro-orm.config'
import 'reflect-metadata'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'

const main = async () => {
  const orm = await MikroORM.init(mikroConfig)
  const migrator = orm.getMigrator()
  await migrator.up()

  const app = express()

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false
    }),

    context: () => ({ em: orm.em })
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({ app })

  app.listen(3000, () => {
    console.log('Listening on port 3000:')
  })
}

main().catch((err) => console.error(err))
