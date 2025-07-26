"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryGrammar = void 0;
/**
 * Abstract base class for query grammars.
 * Defines the interface for compiling query components into database-specific SQL.
 * Each database driver should provide its own grammar implementation.
 *
 * @abstract
 *
 * @example
 *
 * class MySQLGrammar extends QueryGrammar {
 *   compileSelect(query: any): string {
 *     // MySQL-specific SELECT compilation
 *     return `SELECT ${query.columns.join(', ')} FROM ${query.table}`;
 *   }
 *
 *   wrapTable(table: string): string {
 *     return `\`${table}\``;
 *   }
 *
 *   // ... implement other abstract methods
 * }
 *
 */
class QueryGrammar {
}
exports.QueryGrammar = QueryGrammar;
//# sourceMappingURL=QueryGrammar.js.map