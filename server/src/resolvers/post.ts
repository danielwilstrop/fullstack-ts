import { Post } from '../entities/post'
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware
} from 'type-graphql'
import { MyContext } from '../types'
import { isAuth } from '../middleware/isAuth'
import { getConnection } from 'typeorm'

@InputType()
class PostInput {
  @Field()
  title: string

  @Field()
  text: string
}

// Resolver for Posts Entity
@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, {
      nullable: true
    })
    cursor: string | null
  ): Promise<Post[]> {
    const realLimit = Math.min(50, limit)
    const query = getConnection()
      .getRepository(Post)
      .createQueryBuilder('post')
      .orderBy('"createdAt"', 'DESC')
      .take(realLimit)
    if (cursor) {
      query.where('"createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor))
      })
    }
    return query.getMany()
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id)
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorID: req.session.userId
    }).save()
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('title', () => String, { nullable: true }) title: string,
    @Arg('id', () => Int) id: number
  ): Promise<Post | null> {
    const post = await Post.findOne({ where: { id } })
    if (!post) return null
    if (typeof title !== 'undefined') {
      await Post.update({ id }, { title })
    }
    return post
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    try {
      Post.delete(id)
      return true
    } catch (err) {
      return false
    }
  }
}
