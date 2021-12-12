import { MikroORM } from '@mikro-orm/core'
import { __production__ } from './constants'
import { Post } from './entities/post'
import mikroConfig from './mikro-orm.config'

const main = async () => {
  const orm = await MikroORM.init(mikroConfig)
  const migrator = orm.getMigrator()
  await migrator.up()

  // const post = orm.em.create(Post, {
  //   title: 'Hello World'
  // })
  // await orm.em.persistAndFlush(post)

  const post = await orm.em.find(Post, {})
  console.log(post)
}

main().catch((err) => console.error(err))
