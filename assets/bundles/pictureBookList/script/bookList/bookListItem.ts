export interface bookListItem {
    init(data: any);
    open();
    close();
}

export interface oneBookData {
    id:number;
    chapterType:number;
    type:string;
}
