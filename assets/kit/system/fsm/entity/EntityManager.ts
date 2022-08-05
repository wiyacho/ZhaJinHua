import IEntity from "./IEntity";

/**
 * @author
 *
 */
export default class EntityManager {
    private static _instance: EntityManager;
    private _entityMap: Object;
    private _length: number = 0;

    public constructor() {
        this._entityMap = {};
    }

    public static get instance(): EntityManager {
        if (this._instance == null) {
            this._instance = new EntityManager();
        }
        return this._instance;
    }
    public release(): void {
        this._entityMap = null;
        EntityManager._instance = null;
    }

    // this method stores a pointer to the entity in the std::vector
    // m_Entities at the index position indicated by the entity's ID
    // (makes for faster access)
    public registerEntity(newEntity: IEntity): void {
        this._entityMap[newEntity.sid] = newEntity;
        // this.index++;
    }

    // returns a pointer to the entity with the ID given as a parameter
    public getEntityFromID(id: string): IEntity {
        return this._entityMap[id];
    }

    // this method removes the entity from the list
    public removeEntity(entity: IEntity): void {
        let key: any;
        for (key in this._entityMap) {
            if (this._entityMap[key] == entity) {
                delete this._entityMap[key];
            }
        }
    }

    /**
     * 获取所有智体
     */
    public getAllEntity(): Object {
        return this._entityMap;
    }

    /**
     * 获取一个可用的智体
     */
    public getAvailableEntity<T extends IEntity>(clazz: any): T {
        let key: any;
        let availableEntity: T
        for (key in this._entityMap) {
            let entity: T = this._entityMap[key];
            // console.log(entity instanceof clazz);
            if (entity instanceof clazz) {
                if (entity != null) {
                    // if (entity.isDestroy == true) {
                        availableEntity = entity;
                        return availableEntity;
                    // }
                }
            }
        }
        availableEntity = this.createEntity<T>(clazz);
        return availableEntity;
    }

    /**
     * new一个智体
     */
    private createEntity<T extends IEntity>(clazz: new() => T): T {
        let entity: T = new clazz();
        // (entity as IEntity).isDestroy = false;
        // (<IEntity>entity).entityType = EntityType.FISH;
        this.registerEntity(entity);
        this._length++;
        return entity;
    }

    /**
     * get length
     */
    public get length(): number {
        return this._length
    }
}
