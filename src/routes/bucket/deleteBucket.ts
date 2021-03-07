import { FastifyInstance, RequestGenericInterface } from 'fastify'
import { getPostgrestClient } from '../../utils'
import { getConfig } from '../../utils/config'
import { Obj, Bucket, AuthenticatedRequest } from '../../types/types'
import { FromSchema } from 'json-schema-to-ts'

const { serviceKey } = getConfig()

const deleteBucketParamsSchema = {
  type: 'object',
  properties: {
    bucketId: { type: 'string' },
    '*': { type: 'string' },
  },
  required: ['bucketId', '*'],
} as const
interface deleteBucketRequestInterface extends AuthenticatedRequest {
  Params: FromSchema<typeof deleteBucketParamsSchema>
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function routes(fastify: FastifyInstance) {
  fastify.delete<deleteBucketRequestInterface>(
    '/:bucketId',
    { schema: { params: deleteBucketParamsSchema, headers: { $ref: 'authSchema#' } } },
    async (request, response) => {
      const authHeader = request.headers.authorization
      const jwt = authHeader.substring('Bearer '.length)
      const { bucketId } = request.params
      const userPostgrest = getPostgrestClient(jwt)
      const superUserPostgrest = getPostgrestClient(serviceKey)

      const { count: objectCount, error: objectError } = await superUserPostgrest
        .from<Obj>('objects')
        .select('id', { count: 'exact' })
        .eq('bucketId', bucketId)

      console.log(objectCount, objectError)
      if (objectCount && objectCount > 0) {
        return response.status(400).send('Bucket not empty')
      }

      const { data: results, error } = await userPostgrest
        .from<Bucket>('buckets')
        .delete()
        .eq('id', bucketId)
      console.log(results, error)
      return response.status(200).send('Deleted')
    }
  )
}