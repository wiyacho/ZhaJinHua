/**
 * 节点类型
 */
export class LinkedNode<N> {
    /** 元素对象本身的值 */
    public element: N = null;
    /** 指向前一项 */
    public previous: LinkedNode<N> = null;
    /** 指向下一项 */
    public next: LinkedNode<N>;
    constructor(element: N) {
        this.element = element;
    }
}

/**
 * 双向链表
 */
export default class LinkedList<T> {
    /** 将数组转化为链表 */
    public static from<L>(array: L[]) {
        const { length } = array;
        const linkedList = new LinkedList(array.shift());
        linkedList.length = length;
        array.reduce((previous, current) => {
            previous.next = new LinkedNode(current);
            previous.next.previous = previous;
            return previous.next;
        }, linkedList.head);
        return linkedList
    }
    /** 头节点 */
    public head: LinkedNode<T>;
    /** 链表的长度 */
    public length: number = 0;
    constructor(element: T) {
        this.head = new LinkedNode(element);
        this.head.next = this.head;
        this.head.previous = this.head;
        this.length = 1;
    }

    /**
     * @description 用于寻找符合条件的节点，回调函数返回为 true 时，返回对应节点
     * @param cb 用于寻找的回调函数
     */
    public find(cb: (element: LinkedNode<T>) => boolean) {
        let i;
        let currentNode = this.head;
        for (i = 0; i < this.length; i++) {
            if (cb.call(this, currentNode)) { break; }
            currentNode = currentNode.next;
        }
        return i !== this.length ? currentNode : null;
    }


    /**
     * @description 在指定节点插入元素
     * @param newElement 插入元素
     * @param node 被插入节点
     */
    public insert(newElement: T, node: LinkedNode<T>) {
        const newNode = new LinkedNode(newElement);
        const previousNode = this.find((n) => n === node);
        if (previousNode) {
            const rawNextNode = previousNode.next;
            previousNode.next = newNode;
            newNode.previous = previousNode;
            newNode.next = rawNextNode;
            rawNextNode.previous = newNode;
            this.length++;
        }
    }

    /**
     * 删除指定的节点
     * @param node 要删除的节点
     */
    public remove(node: LinkedNode<T>) {
        const deletedNode = this.find((n) => n === node);
        if (deletedNode) {
            if (this.head === deletedNode) {
                this.head = deletedNode.next;
            }
            deletedNode.previous.next = deletedNode.next;
            deletedNode.next.previous = deletedNode.previous;
            this.length--;
        }
    }
}