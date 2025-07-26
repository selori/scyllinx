import type { Model } from "@/model/Model"
import { QueryBuilder } from "@/query/QueryBuilder"
import { Relationship } from "./Relationship"

/**
 * Represents a many-to-many relationship between two models.
 * Uses a pivot table to store the relationship data between the two models.
 * Supports additional pivot columns and constraints.
 *
 * @template Parent - The parent model type
 * @template Related - The related model type
 *
 * @example
 * 
 * // In User model
 * rolesRelation(): BelongsToMany<User, Role> {
 *   return new BelongsToMany(
 *     this,
 *     Role,
 *     'user_roles',    // pivot table
 *     'user_id',       // foreign key for parent
 *     'role_id',       // foreign key for related
 *     'id',            // parent key
 *     'id'             // related key
 *   );
 * }
 *
 * // Usage
 * const user = await User.find(1);
 * const roles = await user.rolesRelation().getResults();
 *
 * // Attach roles
 * await user.rolesRelation().attach([1, 2, 3]);
 *
 * // With pivot data
 * await user.rolesRelation().attach(1, { assigned_at: new Date() });
 * 
 */
export class BelongsToMany<Parent extends Model<any>, Related extends Model<any>> extends Relationship<
  Parent,
  Related
> {
  protected pivotTable: string
  protected relatedPivotKey: string
  protected parentPivotKey: string
  protected relatedKey: string
  protected parentKey: string
  protected pivotColumns: string[] = []
  protected pivotWheres: Array<{
    type?: string
    column: string
    operator?: any
    value?: any
    values?: any[]
  }> = []

  /**
   * Creates a new BelongsToMany relationship instance.
   *
   * @param parent - Parent model instance
   * @param related - Related model constructor
   * @param pivotTable - Name of the pivot table
   * @param foreignKey - Foreign key for parent in pivot table
   * @param relatedKey - Foreign key for related model in pivot table
   * @param parentKey - Local key on parent model
   * @param relatedPivotKey - Local key on related model
   *
   * @example
   * 
   * // User belongs to many Roles through user_roles table
   * new BelongsToMany(
   *   this,           // User instance
   *   Role,           // Role constructor
   *   'user_roles',   // pivot table
   *   'user_id',      // parent foreign key
   *   'role_id',      // related foreign key
   *   'id',           // parent local key
   *   'id'            // related local key
   * );
   * 
   */
  constructor(
    parent: Parent,
    related: new () => Related,
    pivotTable: string,
    foreignKey: string,
    relatedKey: string,
    parentKey: string,
    relatedPivotKey: string,
  ) {
    super(parent, related, foreignKey, parentKey)
    this.pivotTable = pivotTable
    this.parentPivotKey = foreignKey
    this.relatedPivotKey = relatedPivotKey
    this.relatedKey = relatedKey
    this.parentKey = parentKey
  }

  /**
   * Adds constraints to the relationship query.
   * For SQL databases, uses JOIN to connect through pivot table.
   * For ScyllaDB, uses separate queries due to limited JOIN support.
   *
   * @param query - Query builder to add constraints to
   * @returns Modified query builder with relationship constraints
   */
  public addConstraints(query: QueryBuilder<Related, any>): QueryBuilder<Related, any> {
    const connection = this.parent.getConnection()

    if (connection !== "default") {
      const parentKey = this.getParentKey()

      query
        .select("*")
        .addSelect(...this.getPivotColumns())
        .join(
          this.pivotTable,
          `${this.getRelatedTable()}.${this.relatedPivotKey}`,
          "=",
          `${this.pivotTable}.${this.relatedPivotKey}`,
        )
        .where(`${this.pivotTable}.${this.parentPivotKey}`, parentKey)

      for (const where of this.pivotWheres) {
        if (where.type === "in") {
          query.whereIn(where.column, where.values ?? [])
        } else {
          query.where(where.column, where.operator, where.value)
        }
      }
    }

    return query
  }

  /**
   * Gets the relationship results.
   * Handles both SQL and NoSQL database approaches for many-to-many relationships.
   *
   * @returns Promise resolving to array of related models with pivot data
   *
   * @example
   * 
   * const user = await User.find(1);
   * const roles = await user.rolesRelation().getResults();
   *
   * roles.forEach(role => {
   *   console.log(`Role: ${role.name}`);
   *   console.log(`Assigned at: ${role.pivot.assigned_at}`);
   * });
   * 
   */
  public async getResults(): Promise<Related[]> {
    const connection = this.parent.getConnection()

    if (connection === "default") {
      const parentId = this.getParentKey()

      // Get pivot records
      const pivotQuery = this.newPivotQuery()

      for (const where of this.pivotWheres) {
        if (where.type === "in") {
          pivotQuery.whereIn(where.column, where.values ?? [])
        } else {
          pivotQuery.where(where.column, where.operator, where.value)
        }
      }

      const allPivotRows = await pivotQuery.get()

      // Filter for composite partition key
      const pivotRows = allPivotRows.filter((row) => row[this.parentPivotKey] === parentId)

      const relatedIds = pivotRows.map((row) => row[this.relatedPivotKey])

      if (!relatedIds.length) return []

      // Get related models
      const relatedQuery = new QueryBuilder(this.getRelatedTable(), connection)
        .setModel(this.relatedCtor)
        .whereIn(this.relatedKey as any, relatedIds)

      const relatedModels = await relatedQuery.get()

      // Attach pivot data
      for (const model of relatedModels) {
        const pivot = pivotRows.find(
          (pivot) => pivot[this.relatedPivotKey] === model.getAttribute(this.relatedPivotKey),
        )
        model.setAttribute("pivot", pivot)
      }

      return relatedModels as Related[]
    }

    // SQL-supported driver with native join
    return this.get()
  }

  /**
   * Attaches related models to the parent through the pivot table.
   *
   * @param ids - ID or array of IDs to attach
   * @param attributes - Additional pivot table attributes
   * @returns Promise that resolves when attachment is complete
   *
   * @example
   * 
   * const user = await User.find(1);
   *
   * // Attach single role
   * await user.rolesRelation().attach(1);
   *
   * // Attach multiple roles
   * await user.rolesRelation().attach([1, 2, 3]);
   *
   * // Attach with pivot data
   * await user.rolesRelation().attach(1, {
   *   assigned_at: new Date(),
   *   assigned_by: 'admin'
   * });
   * 
   */
  public async attach(ids: any | any[], attributes: Record<string, any> = {}): Promise<void> {
    const idsArray: any[] = Array.isArray(ids) ? ids : [ids]
    const parentKey = this.getParentKey()

    const records: Record<string, any>[] = idsArray.map((id: any) => ({
      [this.parentPivotKey]: parentKey,
      [this.relatedPivotKey]: id,
      ...attributes,
    }))

    await this.newPivotQuery().insert(records)
  }

  /**
   * Detaches related models from the parent by removing pivot table records.
   *
   * @param ids - Optional ID or array of IDs to detach. If not provided, detaches all
   * @returns Promise resolving to number of detached records
   *
   * @example
   * 
   * const user = await User.find(1);
   *
   * // Detach specific roles
   * await user.rolesRelation().detach([1, 2]);
   *
   * // Detach all roles
   * await user.rolesRelation().detach();
   * 
   */
  public async detach(ids?: any | any[]): Promise<number> {
    const qb = this.newPivotQuery().where(this.parentPivotKey, this.getParentKey())

    if (ids != null) {
      const idsArray: any[] = Array.isArray(ids) ? ids : [ids]
      qb.whereIn(this.relatedPivotKey, idsArray)
    }

    return qb.delete()
  }

  /**
   * Synchronizes the relationship to match the given array of IDs.
   * Attaches missing relationships and optionally detaches extra ones.
   *
   * @param ids - Array of IDs that should be attached
   * @param detaching - Whether to detach IDs not in the array (default: true)
   * @returns Promise resolving to sync results with attached/detached arrays
   *
   * @example
   * 
   * const user = await User.find(1);
   *
   * // Sync to specific roles (detaches others)
   * const result = await user.rolesRelation().sync([1, 2, 3]);
   * console.log(`Attached: ${result.attached.length}`);
   * console.log(`Detached: ${result.detached.length}`);
   *
   * // Sync without detaching
   * await user.rolesRelation().sync([4, 5], false);
   * 
   */
  public async sync(ids: any[], detaching = true): Promise<{ attached: any[]; detached: any[]; updated: any[] }> {
    const changes = {
      attached: [] as any[],
      detached: [] as any[],
      updated: [] as any[],
    }

    const current = await this.newPivotQuery().where(this.parentPivotKey, this.getParentKey()).get()

    const currentIds = current.map((r) => r[this.relatedPivotKey])
    const newIds = ids

    const toAttach = newIds.filter((id) => !currentIds.includes(id))
    const toDetach = detaching ? currentIds.filter((id) => !newIds.includes(id)) : []

    if (toAttach.length) {
      await this.attach(toAttach)
      changes.attached = toAttach
    }

    if (toDetach.length) {
      await this.detach(toDetach)
      changes.detached = toDetach
    }

    return changes
  }

  /**
   * Toggles the attachment of related models.
   * Attaches if not currently attached, detaches if currently attached.
   *
   * @param ids - ID or array of IDs to toggle
   * @returns Promise resolving to toggle results with attached/detached arrays
   *
   * @example
   * 
   * const user = await User.find(1);
   *
   * // Toggle roles - attach if not attached, detach if attached
   * const result = await user.rolesRelation().toggle([1, 2, 3]);
   * console.log(`Attached: ${result.attached}`);
   * console.log(`Detached: ${result.detached}`);
   * 
   */
  public async toggle(ids: any | any[]): Promise<{ attached: any[]; detached: any[] }> {
    const idsArray: any[] = Array.isArray(ids) ? ids : [ids]
    const changes = { attached: [] as any[], detached: [] as any[] }

    const current = await this.newPivotQuery()
      .where(this.parentPivotKey, this.getParentKey())
      .whereIn(this.relatedPivotKey, idsArray)
      .get()

    const currentIds = current.map((r) => r[this.relatedPivotKey])
    const toAttach = idsArray.filter((id) => !currentIds.includes(id))
    const toDetach = currentIds

    if (toAttach.length) {
      await this.attach(toAttach)
      changes.attached = toAttach
    }

    if (toDetach.length) {
      await this.detach(toDetach)
      changes.detached = toDetach
    }

    return changes
  }

  /**
   * Updates existing pivot table records for a specific related model.
   *
   * @param id - ID of the related model
   * @param attributes - Attributes to update in the pivot table
   * @returns Promise resolving to number of updated records
   *
   * @example
   * 
   * const user = await User.find(1);
   *
   * // Update pivot data for a specific role
   * await user.rolesRelation().updateExistingPivot(1, {
   *   updated_at: new Date(),
   *   notes: 'Role permissions updated'
   * });
   * 
   */
  public async updateExistingPivot(id: any, attributes: Record<string, any>): Promise<number> {
    return this.newPivotQuery()
      .where(this.parentPivotKey, this.getParentKey())
      .where(this.relatedPivotKey, id)
      .update(attributes)
  }

  /**
   * Specifies additional pivot table columns to include in query results.
   *
   * @param columns - Pivot column names to include
   * @returns This relationship instance for method chaining
   *
   * @example
   * 
   * const user = await User.find(1);
   * const roles = await user.rolesRelation()
   *   .withPivot('assigned_at', 'assigned_by')
   *   .getResults();
   *
   * roles.forEach(role => {
   *   console.log(`Assigned at: ${role.pivot.assigned_at}`);
   *   console.log(`Assigned by: ${role.pivot.assigned_by}`);
   * });
   * 
   */
  public withPivot(...columns: string[]): this {
    this.pivotColumns.push(...columns)
    return this
  }

  /**
   * Adds a WHERE constraint on pivot table columns.
   *
   * @param column - Pivot column name
   * @param operator - Comparison operator or value if using 2-param form
   * @param value - Value to compare against
   * @returns This relationship instance for method chaining
   *
   * @example
   * 
   * const user = await User.find(1);
   * const activeRoles = await user.rolesRelation()
   *   .wherePivot('status', 'active')
   *   .wherePivot('assigned_at', '>', lastWeek)
   *   .getResults();
   * 
   */
  public wherePivot(column: string, operator: any, value?: any): this {
    if (value === undefined) {
      value = operator
      operator = "="
    }
    this.pivotWheres.push({
      column: `${this.pivotTable}.${column}`,
      operator,
      value,
    })
    return this
  }

  /**
   * Adds a WHERE IN constraint on pivot table columns.
   *
   * @param column - Pivot column name
   * @param values - Array of values to match against
   * @returns This relationship instance for method chaining
   *
   * @example
   * 
   * const user = await User.find(1);
   * const roles = await user.rolesRelation()
   *   .wherePivotIn('status', ['active', 'pending'])
   *   .getResults();
   * 
   */
  public wherePivotIn(column: string, values: any[]): this {
    this.pivotWheres.push({
      type: "in",
      column: `${this.pivotTable}.${column}`,
      values,
    })
    return this
  }

  /**
   * Gets the pivot table columns to select with proper aliasing.
   *
   * @protected
   * @returns Array of pivot column select statements
   */
  protected getPivotColumns(): string[] {
    const cols = [
      `${this.pivotTable}.${this.parentPivotKey} as pivot_${this.parentPivotKey}`,
      `${this.pivotTable}.${this.relatedPivotKey} as pivot_${this.relatedPivotKey}`,
    ]
    for (const c of this.pivotColumns) {
      cols.push(`${this.pivotTable}.${c} as pivot_${c}`)
    }
    return cols
  }

  /**
   * Creates a new query builder for the pivot table.
   *
   * @protected
   * @returns QueryBuilder instance for pivot table operations
   */
  protected newPivotQuery(): QueryBuilder<any, any> {
    const related = this.related()
    return new QueryBuilder(this.pivotTable, related.getConnection()).allowFiltering()
  }

  /**
   * Gets the related model's table name.
   *
   * @protected
   * @returns Related model table name
   */
  protected getRelatedTable(): string {
    return this.related().getTable()
  }
}
