const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dfgh567ehrthy',
  postgraphileOptions: {
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true,
    retryOnInitFail: true,
    dynamicJson: true,
    setofFunctionsContainNulls: false,
    ignoreRBAC: false,
    extendedErrors: ['hint', 'detail', 'errcode'],
    appendPlugins: [],
    pgSettings: async (req: any) => ({
      'role': req.user?.role || 'app_anonymous',
      'app.current_user_id': req.user?.id || '0'
    }),
    graphileBuildOptions: {
      pgOmitListSuffix: true,
    },
    enableCors: true,
  }
};

export default config;