import { __production__ } from './constants'
import { Post } from './entities/post'
import { MikroORM } from '@mikro-orm/core'
import path from 'path'

export default {
  entities: [Post],
  dbName: 'danielwilstrop',
  type: 'postgresql',
  port: 1234,
  migrations: {
    path: path.join(__dirname, './migrations'), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/
  },
  debug: !__production__
} as Parameters<typeof MikroORM.init>[0]
