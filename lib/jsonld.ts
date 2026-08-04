/**
 * JSON-LD를 <script> 안에 넣기 위한 직렬화.
 *
 * JSON.stringify는 `<` `>` `&`를 그대로 남긴다. 후기 본문처럼 사용자가 넣은
 * 문자열이 JSON-LD에 들어가면 `</script>` 한 줄로 스크립트 블록을 닫고
 * 임의 마크업·스크립트를 삽입할 수 있다(저장형 XSS).
 *
 * 이스케이프한 값은 JSON 문자열 안에서 원래 문자로 다시 파싱되므로
 * 검색엔진이 읽는 구조화 데이터의 의미는 그대로다.
 * U+2028/2029는 JSON에서는 유효하지만 자바스크립트 소스에서는 줄바꿈으로
 * 해석돼 파싱을 깨뜨리므로 함께 이스케이프한다.
 */

// 소스에 리터럴로 두면 편집기·도구를 거치며 실제 줄 구분자로 변질될 수 있어
// 문자열에서 정규식을 만든다.
const LINE_SEPARATORS = new RegExp("[\\u2028\\u2029]", "g");

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LINE_SEPARATORS, (ch) => "\\u" + ch.charCodeAt(0).toString(16));
}
