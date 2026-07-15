export interface AppConfig {
  port: number;
  database: {
    url: string;
    ssl: boolean;
  };
  webOrigin: string;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  superAdmin: {
    username: string;
    password: string;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  database: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://neondb_owner:npg_pFQWJzLr8ay2@ep-autumn-rice-adb0s1pu.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: process.env.DATABASE_SSL === 'true',
  },
  webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-only-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  superAdmin: {
    username: process.env.SUPER_ADMIN_USERNAME ?? 'superadmin',
    password: process.env.SUPER_ADMIN_PASSWORD ?? 'super-secret-password',
  },
});
