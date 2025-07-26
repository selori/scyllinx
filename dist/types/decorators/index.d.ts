import "reflect-metadata";
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
export declare function Scope(): (target: any, context: ClassMethodDecoratorContext) => void;
//# sourceMappingURL=index.d.ts.map