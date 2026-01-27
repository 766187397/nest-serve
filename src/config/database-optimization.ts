import { registerAs } from '@nestjs/config';

export interface DatabaseOptimizationConfig {
  slowQuery: {
    enabled: boolean;
    threshold: number;
    logLevel: 'error' | 'warn' | 'info';
    maxHistorySize: number;
  };
  queryCache: {
    enabled: boolean;
    defaultTTL: number;
    maxSize: number;
    keyPrefix: string;
  };
  readWriteSplit: {
    enabled: boolean;
    masterConnectionName: string;
    slaveConnectionName: string;
    readWriteRatio: number;
  };
  indexOptimization: {
    enabled: boolean;
    autoAnalyze: boolean;
    analyzeInterval: number;
  };
}

export const getDatabaseOptimizationConfig = (configService: any): DatabaseOptimizationConfig => ({
  slowQuery: {
    enabled: configService.get('DB_SLOW_QUERY_ENABLED', 'true') === 'true',
    threshold: parseInt(configService.get('DB_SLOW_QUERY_THRESHOLD', '1000'), 10),
    logLevel: configService.get('DB_SLOW_QUERY_LOG_LEVEL', 'warn') as 'error' | 'warn' | 'info',
    maxHistorySize: parseInt(configService.get('DB_SLOW_QUERY_MAX_HISTORY', '1000'), 10),
  },
  queryCache: {
    enabled: configService.get('DB_QUERY_CACHE_ENABLED', 'true') === 'true',
    defaultTTL: parseInt(configService.get('DB_QUERY_CACHE_TTL', '300'), 10),
    maxSize: parseInt(configService.get('DB_QUERY_CACHE_MAX_SIZE', '10000'), 10),
    keyPrefix: configService.get('DB_QUERY_CACHE_PREFIX', 'db_query:'),
  },
  readWriteSplit: {
    enabled: configService.get('DB_READ_WRITE_SPLIT_ENABLED', 'false') === 'true',
    masterConnectionName: configService.get('DB_MASTER_CONNECTION', 'default'),
    slaveConnectionName: configService.get('DB_SLAVE_CONNECTION', 'logger'),
    readWriteRatio: parseFloat(configService.get('DB_READ_WRITE_RATIO', '0.7')),
  },
  indexOptimization: {
    enabled: configService.get('DB_INDEX_OPTIMIZATION_ENABLED', 'true') === 'true',
    autoAnalyze: configService.get('DB_AUTO_ANALYZE_ENABLED', 'true') === 'true',
    analyzeInterval: parseInt(configService.get('DB_ANALYZE_INTERVAL', '86400000'), 10),
  },
});

export const DatabaseOptimizationConfig = registerAs('databaseOptimization', () => getDatabaseOptimizationConfig(new (require('@nestjs/config').ConfigService)()));
