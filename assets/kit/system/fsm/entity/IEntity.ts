import StateMachine from "../StateMachine";

export default interface IEntity {
    stateMachine: StateMachine<IEntity>;
    sid?: string;
}
