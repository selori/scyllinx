"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scope = Scope;
require("reflect-metadata");
/**
 * Decorator that marks a method as a query scope.
 * Scopes are reusable query constraints that can be applied to models.
 *
 * @returns Method decorator function
 *
 * @example
 *
 * class User extends Model {
 *   @Scope()
 *   static active(query: QueryBuilder) {
 *     return query.where('status', 'active');
 *   }
 *
 *   @Scope()
 *   static byRole(query: QueryBuilder, role: string) {
 *     return query.where('role', role);
 *   }
 * }
 *
 * // Usage:
 * const activeUsers = await User.query().active().get();
 * const admins = await User.query().byRole('admin').get();
 *
 */
function Scope() {
    return (target, context) => {
        const methodName = context.name.toString();
        const actualTarget = typeof target === "function" ? target : target.constructor;
        // Get existing scopes or create new object
        const scopes = Reflect.getMetadata("__scopes", actualTarget) || {};
        // Add method to scopes
        scopes[methodName] = target[methodName];
        // Update metadata
        Reflect.defineMetadata("__scopes", scopes, actualTarget);
    };
}
//# sourceMappingURL=index.js.map