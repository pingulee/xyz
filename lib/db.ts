import mysql from "mysql2/promise";

const globalForMysql = globalThis as typeof globalThis & {
  mysqlPool?: mysql.Pool;
};

export function getPool() {
  if (!globalForMysql.mysqlPool) {
    const requiredEnv = [
      "MYSQL_HOST",
      "MYSQL_USER",
      "MYSQL_PASSWORD",
      "MYSQL_DATABASE",
    ];
    const missingEnv = requiredEnv.filter((key) => !process.env[key]);

    if (missingEnv.length > 0) {
      throw new Error(`Missing MySQL environment variables: ${missingEnv.join(", ")}`);
    }

    globalForMysql.mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT ?? 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 5,
      // 무제한 대기열은 요청 폭주 때 메모리를 계속 소비한다. DB가 포화되면
      // 제한된 수만 대기시키고 나머지는 빠르게 실패시켜 프로세스를 보호한다.
      queueLimit: 50,
      connectTimeout: 5_000,
      namedPlaceholders: true,
      // 원격 DB가 유휴 커넥션을 끊어도 죽은 커넥션을 재사용하지 않도록 방지
      enableKeepAlive: true,
      keepAliveInitialDelay: 10_000,
      idleTimeout: 60_000,
      maxIdle: 2,
    });
  }

  return globalForMysql.mysqlPool;
}
