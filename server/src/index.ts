import { MikroORM } from '@mikro-orm/core'
import { COOKIE_NAME, __production__ } from './constants'
import mikroConfig from './mikro-orm.config'
import 'reflect-metadata'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { MyContext } from './types'
import Redis from 'ioredis'
import cors from 'cors'

//A fix to the types so we can add the userID to the session object on user login (thanks StackOverflow!)
declare module 'express-session' {
  export interface SessionData {
    userId: number
  }
}

const main = async () => {
  const orm = await MikroORM.init(mikroConfig)
  const migrator = orm.getMigrator()
  await migrator.up() // run all migrations

  const app = express()

  const RedisStore = connectRedis(session)
  const redis = new Redis()

  app.use(
    cors({
      credentials: true,
      origin: 'http://localhost:3000'
    })
  )

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: true,
        secure: __production__, //turn this off if not using https
        sameSite: 'lax' //protects against cross-site scripting
      },
      secret: 'khjfweuygdljiqw', //secret for signing the cookie - to be moved to ENV later
      saveUninitialized: false,
      resave: true
    })
  )

  const apolloServer = new ApolloServer({
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),

    context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({
    app,
    cors: false
  })

  app.listen(4000, () => {
    console.log(`Listening on port: 4000`)
  })
}

main().catch((err) => console.error(err))
