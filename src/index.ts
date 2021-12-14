import { MikroORM } from '@mikro-orm/core'
import { __production__ } from './constants'
import mikroConfig from './mikro-orm.config'
import 'reflect-metadata'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { MyContext } from './types'
const redis = require('redis')

const main = async () => {
  const orm = await MikroORM.init(mikroConfig)
  const migrator = orm.getMigrator()
  await migrator.up() // run all migrations

  const app = express()

  const RedisStore = connectRedis(session)
  const redisClient = redis.createClient()

  app.use(
    session({
      name: 'danwil', //name of cookie
      store: new RedisStore({
        client: redisClient,
        disableTouch: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: true,
        secure: __production__, //turn this off if not using https
        sameSite: 'lax' //protects against cross-site scripting
      },
      secret: 'khjfweuygdljiqw', //secret for signing the cookie - to be moved to ENV later
      resave: false
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),

    context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({ app }) //

  app.listen(3000, () => {
    console.log('Listening on port 3000:')
  })
}

main().catch((err) => console.error(err))
