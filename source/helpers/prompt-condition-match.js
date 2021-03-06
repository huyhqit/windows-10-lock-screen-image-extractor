/**
 *  @Helper
 *  @Input:
 *    - process: the current process run by node
 *  @Output:
 *    - return:
 *      - true: detect no additional arguments from user
 *      - false: detect additional arguments from user
 */
export default function (process) {
  return process.argv.splice(2).length <= 0;
}
