export interface PoolStats {
  totalConnections: number;
  idleConnections: number;
  activeConnections: number;
  waitingRequests: number;
  maxConnections: number;
  minConnections: number;
}

export interface MysqlPool {
  _allConnections: Array<unknown>;
  _freeConnections: Array<unknown>;
  _connectionQueue: Array<unknown>;
  _connectionLimit: number;
}

export interface PostgresPool {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
  options: {
    max: number;
    min: number;
  };
}

export interface MysqlDriver {
  master: MysqlPool;
}

export interface PostgresDriver {
  pool: PostgresPool;
}
