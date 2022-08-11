import dotenv from 'dotenv'

type StorageBackendType = 'file' | 's3'
type StorageConfigType = {
  anonKey: string
  serviceKey: string
  tenantId: string
  region: string
  postgrestURL: string
  globalS3Bucket: string
  globalS3Endpoint?: string
  jwtSecret: string
  jwtAlgorithm: string,
  fileSizeLimit: number
  storageBackendType: StorageBackendType
  fileStoragePath?: string
  isMultitenant: boolean
  multitenantDatabaseUrl?: string
  xForwardedHostRegExp?: string
  postgrestURLSuffix?: string
  adminApiKeys: string
  encryptionKey: string
}

function getOptionalConfigFromEnv(key: string): string | undefined {
  return process.env[key]
}

function getConfigFromEnv(key: string): string {
  const value = getOptionalConfigFromEnv(key)
  if (!value) {
    throw new Error(`${key} is undefined`)
  }
  return value
}

function getOptionalIfMultitenantConfigFromEnv(key: string): string | undefined {
  return getOptionalConfigFromEnv('IS_MULTITENANT') === 'true'
    ? getOptionalConfigFromEnv(key)
    : getConfigFromEnv(key)
}

export function getConfig(): StorageConfigType {
  dotenv.config()
  let pgrstJwtSecret = getOptionalIfMultitenantConfigFromEnv('PGRST_JWT_SECRET') || ''
  if (getOptionalConfigFromEnv('PGRST_JWT_SECRET_IS_BASE64') === 'true') {
    pgrstJwtSecret = Buffer.from(pgrstJwtSecret, 'base64').toString('binary')
  }

  return {
    anonKey: getOptionalIfMultitenantConfigFromEnv('ANON_KEY') || '',
    serviceKey: getOptionalIfMultitenantConfigFromEnv('SERVICE_KEY') || '',
    tenantId:
      getOptionalConfigFromEnv('PROJECT_REF') ||
      getOptionalIfMultitenantConfigFromEnv('TENANT_ID') ||
      '',
    region: getConfigFromEnv('REGION'),
    postgrestURL: getOptionalIfMultitenantConfigFromEnv('POSTGREST_URL') || '',
    globalS3Bucket: getConfigFromEnv('GLOBAL_S3_BUCKET'),
    globalS3Endpoint: getOptionalConfigFromEnv('GLOBAL_S3_ENDPOINT'),
    jwtSecret: pgrstJwtSecret,
    jwtAlgorithm: getOptionalConfigFromEnv('PGRST_JWT_ALGORITHM') || 'HS256',
    fileSizeLimit: Number(getConfigFromEnv('FILE_SIZE_LIMIT')),
    storageBackendType: getConfigFromEnv('STORAGE_BACKEND') as StorageBackendType,
    fileStoragePath: getOptionalConfigFromEnv('FILE_STORAGE_BACKEND_PATH'),
    isMultitenant: getOptionalConfigFromEnv('IS_MULTITENANT') === 'true',
    multitenantDatabaseUrl: getOptionalConfigFromEnv('MULTITENANT_DATABASE_URL'),
    xForwardedHostRegExp: getOptionalConfigFromEnv('X_FORWARDED_HOST_REGEXP'),
    postgrestURLSuffix: getOptionalConfigFromEnv('POSTGREST_URL_SUFFIX'),
    adminApiKeys: getOptionalConfigFromEnv('ADMIN_API_KEYS') || '',
    encryptionKey: getOptionalConfigFromEnv('ENCRYPTION_KEY') || '',
  }
}
