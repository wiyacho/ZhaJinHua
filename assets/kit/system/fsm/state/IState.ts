import IEntity from "../entity/IEntity";
import Telegram from "../message/Telegram";

/**
 * @author
 * sxt
 */
export default interface IState<T extends IEntity> {
    entity: T;

    onMessage(entity: IEntity, telegram: Telegram): boolean;

    enter(data?: any): Promise<any>;

    execute(data?: any): void;

    exit(data?: any): void;
}