type AsyncFn = () => Promise<void>;

/**
 * 스키마 보정 DDL을 프로세스당 1회만 실행하도록 메모이즈한다.
 * 원격 운영 DB에 매 요청마다 ALTER/CREATE 문이 나가지 않도록 하기 위함.
 * 실패하면 다음 호출에서 다시 시도한다.
 */
export function oncePerProcess(fn: AsyncFn): AsyncFn {
  let promise: Promise<void> | null = null;
  return () => {
    promise ??= fn().catch((error) => {
      promise = null;
      throw error;
    });
    return promise;
  };
}
