export interface Crud<Entity, ID> {
  findById(id: ID | string): Promise<Entity | undefined>

  findAll(): Promise<Entity[]>

  create(entity: Entity): Promise<Entity>

  update(entity: Entity): Promise<void>

  deleteById(id: ID | string): Promise<void>
}
